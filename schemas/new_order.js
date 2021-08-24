const Joi = require('joi');

const schema = Joi.object({
  items: Joi.array().items(Joi.string()).min(1),
  owner: Joi.string().required(),
  datePlaced: Joi.string().required(),
  price: Joi.number().min(0).required(),
});

module.exports = schema;