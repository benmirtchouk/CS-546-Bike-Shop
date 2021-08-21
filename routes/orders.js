const express = require('express');
const router = express.Router();
const products = require("../data").products;
const orders = require("../data").orders;
const users = require("../data").users;

router.get('/', async function(req, res, next){
    var product_list = await products.getAllInStock()
    var msg = "";
    let data = {
        inStockList: product_list, 
        errorMessage: msg,
        user: req.session.user
    }; //need to verify if logged in as registered user
    res.render('pages/order', data);
})

router.post('/', async function(req, res){
    let newOrder = req.body;
    console.log(newOrder);
    //get required info
    var userID = await users.getByEmail(newOrder.email);
    var orderedProduct = await products.get(newOrder.product);
    var orderDate = new Date();
    var orderedItems = [];
    for (var i=0; i<parseInt(newOrder.amount,10); i++){
        orderedItems.push(newOrder.product);
    }
    //post order to mongoDB
    var orderDetail = {owner:userID._id, items : orderedItems, datePlaced:orderDate, price:orderedProduct.price}
    var msg = "";
    console.log(orderDetail);
    try{
        const _ = orders.create(orderDetail)
        var product_list = await products.getAllInStock()
        let data = {
            inStockList: product_list, 
            errorMessage: msg,
            user: req.session.user
        }; //need to verify if logged in as registered user
        res.render('pages/order', data)
    }catch(e){
        msg = "Failed to submit order, please check stock number and email"
        res.render('pages/orderError',{errorMessage: msg, user: req.session.user})
    }
    
    if(!_){
        msg = "Failed to submit order, please check stock number and email"
        res.render('pages/orderError',{errorMessage: msg, user: req.session.user})        
    }

})

module.exports = router;