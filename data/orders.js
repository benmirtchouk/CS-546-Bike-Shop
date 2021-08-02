const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const orders = mongoCollections.orders;
const users = require('./users');
const products = require('./products');

async function get(id) {
  const ordersCollection = await orders();
  let order = await ordersCollection.findOne({ _id: ObjectId(id) });

  if (order !== null) {
    order._id = order._id.toString();
    order.items = order.items.map((id) => id.toString());
    order.owner = order.owner.toString();
  }

  return order;
}

async function create(order) {
  const owner = users.get(order.owner);
  if (owner === null) throw `no user with id ${order.owner}`;
  
  // order.items.forEach(id => {
  //   const product = products.get(id);
  //   if (product === null) {
  //     throw `no product with id ${id}`;
  //   }
  //   else if (product.stock === 0){
  //     throw `no product left IN STOCK with id ${id}`;
  //   }
  //   else{
  //     //update product's stock
  //     product.stock = product.stock - 1;
  //     products.update(id, product)
  //   }
  // });

  for (const id of order.items){
    const product = await products.get(id);
    if (product === null) {
      throw `no product with id ${id}`;
    }
    else if (product.stock === 0){
      throw `no product left IN STOCK with id ${id}`;
      //TODO: Do we want to throw exception here? 
      //What if user orders multiple different bikes
    }
    else{
      //update product's stock
      let currentStock = product.stock - 1;
      await products.updateStock(ObjectId(id), currentStock)
    }    
  }

  const newOrder = {
    'items': order.items.map(id => ObjectId(id)),
    'owner': ObjectId(order.owner),
    'datePlaced': order.datePlaced,
    'updates': [],
    'status': 'newly created',
    'price': order.price
  };

  const ordersCollection = await orders();
  const insertInfo = await ordersCollection.insertOne(newOrder);
  if (insertInfo.insertedCount === 0) throw 'Could not add new order';

  return insertInfo.ops[0];
}

async function addUpdate(id, update) {
  const ordersCollection = await orders();
  const updateInfo = await ordersCollection.updateOne({ _id: ObjectId(id) }, { $push: {updates: update} });

  if (updateInfo.modifiedCount === 0) {
    throw `Could not update order with id ${id}`;
  }
}

async function updateStatus(id, status) {
  const ordersCollection = await orders();
  const updateInfo = await ordersCollection.updateOne({ _id: ObjectId(id) }, { $set: {status: status} });

  if (updateInfo.modifiedCount === 0) {
    throw `Could not update order with id ${id}`;
  }
}

async function remove(id) {
  const ordersCollection = await orders();
  const deletionInfo = await ordersCollection.removeOne({ _id: ObjectId(id) });

  if (deletionInfo.deletedCount === 0) {
    throw `Could not delete order with id of ${id}`;
  }
}

module.exports = {
  get,
  create,
  addUpdate,
  updateStatus,
  remove,
};
