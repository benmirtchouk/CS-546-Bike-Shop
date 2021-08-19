const userRoutes = require("./user");
const productRoutes = require("./products");
const products = require("../data").products;
const ordersRoutes = require("./orders")

const constructorMethod = (app) => {
  app.use('/user', userRoutes);
  app.use('/bikes', productRoutes);
  app.use('/orders', ordersRoutes)

  app.get('/', async (req, res ) => {

    const productList = await products.getAllUpTo(20);

    // Map the model data to what handlebars can use
    productList.map(product => {
      product.isLowStock = product.stock < 5;
      product.price = product.price.toFixed(2);
    });

    const handlebarData = {
      header: {
        title: "Welcome to the Bike Shop!"
      },
      page: {
        title: "Bike Shop"
      },
      bikes: productList,
      user: req.session.user
    };
    
    res.render("homepage", handlebarData);
  })
  app.use('*', (req, res) => {
    res.status(404).send();
  });
};

module.exports = constructorMethod;