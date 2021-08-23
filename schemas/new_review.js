const Joi = require('joi');

const schema = Joi.object({
  owner: Joi.string().required(),
  product: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  body: Joi.string().min(1).required(),

  verified: Joi.bool().optional(),
  pictures: Joi.array().items(Joi.string()).optional(),
});

module.exports = schema;