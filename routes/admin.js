const express = require('express');
const router = express.Router();
const products = require("../data").products;
const orders = require("../data").orders;
const authHelper = require("../middleware/authentication");


router.get("/", async (req, res) => {

    const user = authHelper.getUserIfAdmin(req);
    if(!user) {
        authHelper.endRequestDueToBeingUnauthorized(res);
        return;
    }

    const productList = await products.getAllUpTo(20);
    const orderList = await orders.aggregateOrders();


    productList.forEach(product => {
        const orderAmount = orderList[product._id];
        product.orderCount = !!orderAmount ? orderAmount : 0;
        const revenue = orderAmount * product.price;
        product.revenue = isNaN(revenue) ? 0 : revenue.toFixed(2);
        product.price = product.price.toFixed(2);
      });

      // Grab the top sellers, by revenue, and sort in descending order for handlebars
      const topSellers = productList
                        .filter( e => e.orderCount > 0 )
                        .sort( (a, b) => {return a.revenue + b.revenue })
                        .slice(0, 3);

    const handlebarData = {
        header: {
            title: `Admin Panel`
          },
          page: {
            title: "Bike Shop Management"
          }, 
          footer: {
              linkHome: true
          },
          user: user, 
          metrics: {}, 
          products: productList,
          topSellers: topSellers

    }

    res.render('layouts/admin', handlebarData);
});


module.exports = router;