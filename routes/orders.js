const express = require('express');
const userData = require("../data/users");
const productData = require("../data/products");
const router = express.Router();
const products = require("../data").products;
const orders = require("../data").orders;
const users = require("../data").users;

router.get('/', async function (req, res, next) {
    var product_list = await products.getAllInStock()
    var msg = "";
    let data = {
        inStockList: product_list,
        errorMessage: msg,
        user: req.session.user,
        page: { title: 'Orders' },
    }; //need to verify if logged in as registered user
    res.render('pages/order', data);
})

router.post('/cancel', async function (req, res, next) {
    let orderid = req.body.orderid;

    try{
        if (typeof orderid !== 'string') throw 'orderid must be a string';
        let oid = ObjectId(orderid);
    } catch (e) {
        return res.json({error: 'orderid must be a valid id string'});
    }
    const _ = await orders.remove(req.body.orderid)
    
    res.redirect('orders/pastOrders');
})

router.get('/pastOrders', async function (req, res, next) {
    if (!req.session.user) return res.status(401).json({error: 'You must be logged in to see orders.'});
    
    var orders_list = await orders.getPendingOrdersByUser(req.session.user._id)
    var ordersItemName = [];
    for (const eachOrder of orders_list) {
        for (const eachItem of eachOrder.items) {
            var productInfo = await products.get(eachItem);
            ordersItemName.push(productInfo.name)
        }
        eachOrder.ordersItemName = ordersItemName;
    }

    var past_orders_list = await orders.getPastOrdersByUser(req.session.user._id)
    var past_ordersItemName = [];
    for (const eachOrder of past_orders_list) {
        let names = []
        for (const eachItem of eachOrder.items) {
            var productInfo = await products.get(eachItem);
            names.push(productInfo.name);
        }
        eachOrder.names = names;
    }

    var msg = "";
    let data = {
        PendingOrders: orders_list,
        PastOrders: past_orders_list,
        errorMessage: msg,
        user: req.session.user,
        page: { title: 'Orders' },
    }; //need to verify if logged in as registered user
    res.render('pages/orderSummary', data);
});

router.post('/checkout', async function (req, res) {
    const user = req.session.user
    
    if (!user) {
        return res.status(400).json({message: "You are not logged in."});
    }
    if (user.cart.length === 0) {
        return res.status(400).json({message: "Cannot checkout an empty cart."});
    }

    let total = 0;
    for (let productid of user.cart) {
        let product = await productData.get(productid);
        if (product === null) {
            return req.status(404).json({message: 'invalid product id'});
        } else {
            total += product.price;
        }
    }

    total = total.toFixed(2);

    //post order to mongoDB
    let orderDetail = {
        owner: user._id,
        items: user.cart,
        datePlaced: new Date().toISOString(),
        price: total
    }
    let msg = "";
    try {
        const o = await orders.create(orderDetail);
        await userData.clearCart(user._id);
        req.session.user.cart = [];
        res.redirect('/orders/pastOrders');
    } catch (e) {
        console.log("error", e);
        msg = "Failed to submit order, please check stock number and email"
        res.render('pages/orderError', {
            errorMessage: msg, 
            user: req.session.user,
            page: { title: 'Order Error' }
        });
    }
})

module.exports = router;