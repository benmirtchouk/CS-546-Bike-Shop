const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const products = require('./products');

async function get(id) {
  const usersCollection = await users();
  let user = await usersCollection.findOne({ _id: ObjectId(id) });

  if (user !== null) {
    user._id = user._id.toString();
    try{
      user.cart = user.cart.map((id) => id.toString());
    }catch(err) {
      user.cart = user.cart
    }
    
  }

  return user;
}

async function getByEmail(email){
  const usersCollection = await users();
  let user = await usersCollection.findOne({ email: email });
  return user;
}

async function create(user) {
  let newUser = {
    'email': user.email,
    'firstName': user.firstName,
    'lastName': user.lastName,
    'admin': user.admin,
    'password': user.password,
    'address': {
      'address': user.address.address,
      'country': user.address.country,
      'city': user.address.city,
      'zipcode': user.address.zipcode
    },
    'cart': []
  };
  
  const usersCollection = await users();
  const insertInfo = await usersCollection.insertOne(newUser);
  if (insertInfo.insertedCount === 0) throw 'Could not add new user';

  return insertInfo.ops[0];
}

async function update(id, user) {
  const usersCollection = await users();
  const updateInfo = await usersCollection.updateOne({ _id: ObjectId(id) }, { $set: user });

  if (updateInfo.modifiedCount === 0) {
    throw `Could not update user with id ${id}`;
  }
}

async function addToCart(id, productid) {
  const usersCollection = await users();
  const updateInfo = usersCollection.updateOne({ _id: id }, { $push: { cart: ObjectId(productid) } });

  if (updateInfo.modifiedCount === 0) {
    throw `Could not update user with id ${id}`;
  }
}

async function getCart(id) {
  const user = this.get(id);
  if (user === null) throw `no user with ${id} found`;

  const cartIds = user.cart;
  return cartIds.map((id) => products.get(id));
}

async function remove(id) {
  const usersCollection = await users();
  const deletionInfo = await usersCollection.removeOne({ _id: ObjectId(id) });

  if (deletionInfo.deletedCount === 0) {
    throw `Could not delete user with id of ${id}`;
  }
}

module.exports = {
  get,
  create,
  update,
  addToCart,
  getCart,
  remove,
  getByEmail
};
