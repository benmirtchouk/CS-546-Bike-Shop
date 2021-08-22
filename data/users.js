const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const products = require('./products');
const new_user_schema = require('../schemas/new_user');
const bcrypt = require('bcrypt');

async function get(id) {
  if (typeof id !== 'string') throw `id must be a string but ${typeof id} provided`;

  const usersCollection = await users();
  let user = await usersCollection.findOne({ _id: ObjectId(id) });

  if (user !== null) {
    user._id = user._id.toString();
    user.cart = user.cart.map((id) => id.toString());
  }

  return user;
}

async function getByEmail(email) {
  if (typeof email !== 'string') throw `email must be a string but ${typeof email} provided`;

  const usersCollection = await users();
  let user = await usersCollection.findOne({ email: email });
  return user;
}

async function create(user_data) {
  const { error, value: user } = new_user_schema.validate(user_data, {abortEarly: false, allowUnknown: true, stripUnknown: true});
  if (error) throw error.details.map(x => x.message).join(', ');

  user.cart = [];
  if (user.admin === undefined) user.admin = false;
  delete user.confirmPassword;
  user.password = await bcrypt.hash(user.password, 10);
  user.email = user.email.toLowerCase()

  const usersCollection = await users();
  const insertInfo = await usersCollection.insertOne(user);
  if (insertInfo.insertedCount === 0) throw 'Could not add new user';

  const new_user = insertInfo.ops[0];
  new_user._id = new_user._id.toString();
  new_user.cart = new_user.cart.map((id) => id.toString());
  return new_user;
}

async function addToCart(id, productid) {
  if (typeof id !== 'string') throw `id must be a string but ${typeof id} provided`;
  if (typeof productid !== 'string') throw `productid must be a string but ${typeof productid} provided`;

  const usersCollection = await users();
  const updateInfo = usersCollection.updateOne({ _id: ObjectId(id) }, { $push: { cart: ObjectId(productid) } });

  if (updateInfo.modifiedCount === 0) {
    throw `Could not update user with id ${id}`;
  }
}

async function getCart(id) {
  if (typeof id !== 'string') throw `id must be a string but ${typeof id} provided`;

  const user = this.get(id);
  if (user === null) throw `no user with ${id} found`;

  const cartIds = user.cart;
  return cartIds.map((id) => products.get(id));
}

async function remove(id) {
  if (typeof id !== 'string') throw `id must be a string but ${typeof id} provided`;

  const usersCollection = await users();
  const deletionInfo = await usersCollection.removeOne({ _id: ObjectId(id) });

  if (deletionInfo.deletedCount === 0) {
    throw `Could not delete user with id of ${id}`;
  }
}

module.exports = {
  get,
  getByEmail,
  create,
  addToCart,
  getCart,
  remove,
  getByEmail
};
