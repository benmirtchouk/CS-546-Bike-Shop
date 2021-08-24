const express = require('express');
const userData = require("../data/users");
const productData = require("../data/orders");
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
        user: req.session.user
    }; //need to verify if logged in as registered user
    res.render('pages/order', data);
})

router.post('/cancel', async function (req, res, next) {
    //console.log("Let's cancel something")
    //console.log(req.body)
    const _ = await orders.remove(req.body.id)
    var orders_list = await orders.getOrdersByUser(req.session.user._id)
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
        for (const eachItem of eachOrder.items) {
            var productInfo = await products.get(eachItem);
            ordersItemName.push(productInfo.name)
        }
        eachOrder.ordersItemName = past_ordersItemName;
    }

    var msg = "";
    let data = {
        PendingOrders: orders_list,
        PastOrders: past_orders_list,
        errorMessage: msg,
        user: req.session.user
    }; //need to verify if logged in as registered user
    res.render('pages/orderSummary', data);
})

router.get('/pastOrders', async function (req, res, next) {
    var orders_list = await orders.getOrdersByUser(req.session.user._id)
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
        for (const eachItem of eachOrder.items) {
            var productInfo = await products.get(eachItem);
            ordersItemName.push(productInfo.name)
        }
        eachOrder.ordersItemName = past_ordersItemName;
    }

    var msg = "";
    let data = {
        PendingOrders: orders_list,
        PastOrders: past_orders_list,
        errorMessage: msg,
        user: req.session.user
    }; //need to verify if logged in as registered user
    res.render('pages/orderSummary', data);
})

router.post('/', async function (req, res) {
    let newOrder = req.body;
    console.log(newOrder);
    //get required info
    var userID = await users.getByEmail(newOrder.email);
    var orderedProduct = await products.get(newOrder.product);
    var orderDate = new Date();
    var orderedItems = [];
    for (var i = 0; i < parseInt(newOrder.amount, 10); i++) {
        orderedItems.push(newOrder.product);
    }
    //post order to mongoDB
    var orderDetail = {owner: userID._id, items: orderedItems, datePlaced: orderDate, price: orderedProduct.price}
    var msg = "";
    console.log(orderDetail);
    try {
        const _ = orders.create(orderDetail)
        var product_list = await products.getAllInStock()
        let data = {
            inStockList: product_list,
            errorMessage: msg,
            user: req.session.user
        }; //need to verify if logged in as registered user
        res.render('pages/order', data)
    } catch (e) {
        msg = "Failed to submit order, please check stock number and email"
        res.render('pages/orderError', {errorMessage: msg, user: req.session.user})
    }

    if (!_) {
        msg = "Failed to submit order, please check stock number and email"
        res.render('pages/orderError', {errorMessage: msg, user: req.session.user})
    }

})

router.post('/checkout', async function (req, res) {
    if (!req.session.user) {
        res.status(400).json({message: "You are not logged in."});
        return;
    }

    const user = req.session.user
    const itemList = user.cart.map(async (id) =>
        await productData.get(id)
    )
    const total = itemList.reduce((sum, item) => sum + item.price, 0)

    //post order to mongoDB
    let orderDetail = {
        owner: user._id,
        items: user.cart,
        datePlaced: new Date(),
        price: total
    }
    let msg = "";
    try {
        const _ = orders.create(orderDetail);
        await userData.clearCart(user._id);
        req.session.user.cart = [];
        res.redirect('/orders/pastOrders');
    } catch (e) {
        msg = "Failed to submit order, please check stock number and email"
        res.render('pages/orderError', {errorMessage: msg, user: req.session.user})
    }
})

module.exports = router;