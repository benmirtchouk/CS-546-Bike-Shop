const Joi = require('joi');

const schema = Joi.object({
  address: Joi.string().required(),
  country: Joi.string().required(),
  city: Joi.string().required(),
  zipcode: Joi.string().required(),
});

module.exports = schema;