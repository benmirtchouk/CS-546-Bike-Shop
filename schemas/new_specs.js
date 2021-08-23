const Joi = require('joi');

const schema = Joi.object({
    length: Joi.number().integer().min(0).required(),
    height: Joi.number().integer().min(0).required(),
    width: Joi.number().integer().min(0).required(),
    frame: Joi.string().optional(),
    fork: Joi.string().optional(),
    shock: Joi.string().optional(),
    tire: Joi.string().optional(),
    shifter: Joi.string().optional(),
    chain: Joi.string().optional()
});

module.exports = schema;