const mongoCollections = require("../config/mongoCollections");
const products = require("../data").products;


const constructorMethod = (app) => {

  app.use('/', async (req, res ) => {

    const productList = await products.getAllUpTo(20);

    // Map the model data to what handlebars can use
    productList.map(product => {
      product.isLowStock = product.stock < 5
      product.price = product.price.toFixed(2);
    });

    const handlebarData = {
      header: {
        title: "Welcome to the Bike Shop!"
      },
      page: {
        title: "Bike Shop"
      },
      bikes: productList
      
    }
    res.render("layouts/homepage", handlebarData)
  })


  app.use('*', (req, res) => {
    res.status(404).send();
  });
};

module.exports = constructorMethod;