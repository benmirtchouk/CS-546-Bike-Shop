const Joi = require('joi');

const schema = Joi.object({
    id: Joi.string()
  });

module.exports = schema;