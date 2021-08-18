const Joi = require('joi');
const address = require('./address');

const schema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
	confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
	firstName: Joi.string().required(),
	lastName: Joi.string().required(),
	address: address.optional()
});

module.exports = schema;