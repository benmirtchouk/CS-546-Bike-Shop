const express = require('express');
const router = express.Router();
const products = require("../data").products;

router.get('/', async function(req, res, next){
    var product_list = await products.getAllInStock()
    let data = {registered:true, inStockList: product_list};//need to verify if logged in as registered user
    res.render('layouts/order', data)
})

router.post('/', async function(req, res){
    //post order to mongoDB
})

module.exports = router;