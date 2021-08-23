
const userRoutes = require("./user");
const productRoutes = require("./products");
const reviewRoutes = require("./reviews");
const adminRoutes = require("./admin");
const data = require("../data");
const products = data.products;
const metrics = data.metrics;
const ordersRoutes = require("./orders")


const constructorMethod = (app) => {
  app.use('/user', userRoutes);
  app.use('/bikes', productRoutes);
  app.use('/reviews', reviewRoutes);
  app.use('/orders', ordersRoutes)

  app.use('/admin', adminRoutes);

  app.get('/', async (req, res ) => {
    metrics.notifyLandingPageView();

    const productList = await products.getAllUpTo(20);

    // Map the model data to what handlebars can use
    productList.map(product => {
      product.isLowStock = product.stock < 5;
      product.price = product.price.toFixed(2);
    });

    const tags = await products.getAllTags();

    const handlebarData = {
      header: {
        title: "Welcome to the Bike Shop!"
      },
      page: {
        title: "Bike Shop"
      },
      bikes: productList,
      user: req.session.user,
      tags: tags,
      partial: 'homepage-scripts'
    };
    
    res.render("pages/homepage", handlebarData);
  })
  app.use('*', (req, res) => {
    res.status(404).send();
  });
};

module.exports = constructorMethod;