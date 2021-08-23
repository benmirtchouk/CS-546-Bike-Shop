const Joi = require('joi');
const spec_schema = require('./new_specs');


const schema = Joi.object({
    name: Joi.string().required(), 
    slug: Joi.string().regex(/\w+/).required(),
    description: Joi.string().required(),
    tags: Joi.array().items(Joi.string().optional()).required(),
    pictures: Joi.array().items(Joi.string().optional()).required(),
    stock: Joi.number().integer().min(0).required(),
    price: Joi.number().min(0).required(),
    specs: spec_schema.required()

  });

module.exports = schema;