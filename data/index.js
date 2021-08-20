const usersData = require('./users');
const productsData = require('./products');
const reviewsData = require('./reviews');
const ordersData = require('./orders');
const metricsData = require('./metrics');

module.exports = {
  users: usersData,
  products: productsData,
  reviews: reviewsData,
  orders: ordersData,
<<<<<<< HEAD
  metrics: metricsData
};
=======
};

async function main() {
  //try removing the await keyword and run the application
  console.log(await ordersData.getOrdersByUser('611f275a7aa262fdb0355bad'));

}

//comment this out if you uncomment main2 below
main();
>>>>>>> e90a01e (new func for orders)
