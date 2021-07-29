const constructorMethod = (app) => {
  app.use('*', (req, res) => {
    res.status(404).send();
  });
};

module.exports = constructorMethod;