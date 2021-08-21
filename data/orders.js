const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const orders = mongoCollections.orders;
const users = require('./users');
const products = require('./products');
const new_order_schema = require('../schemas/new_order');
const mongoOperations = require('./mongoOperations');

async function get(id) {
  if (typeof id !== 'string') throw `id must be a string but ${typeof id} provided`;

  const ordersCollection = await orders();
  let order = await ordersCollection.findOne({ _id: ObjectId(id) });

  if (order !== null) {
    order._id = order._id.toString();
    order.items = order.items.map((id) => id.toString());
    order.owner = order.owner.toString();
  }

  return order;
}

async function create(order_data) {
  const { error, value: order } = new_order_schema.validate(order_data, {abortEarly: false, allowUnknown: true, stripUnknown: true});
  if (error) throw error.details.map(x => x.message).join(', ');

  const owner = users.get(order.owner);
  if (owner === null) throw `no user with id ${order.owner}`;

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
      await products.updateStock(id, currentStock)
    }    
  }

  order.items = order.items.map(id => ObjectId(id));
  order.owner = ObjectId(order.owner);
  order.status = 'newly created';
  order.updates = [];

  const ordersCollection = await orders();
  const insertInfo = await ordersCollection.insertOne(order);
  if (insertInfo.insertedCount === 0) throw 'Could not add new order';

  let inserted = insertInfo.ops[0];
  inserted.items = inserted.items.map((id) => id.toString());
  inserted.owner = inserted.owner.toString();

  return inserted;
}

async function addUpdate(id, update) {
  if (typeof id !== 'string') throw `id must be a string but ${typeof id} provided`;
  if (typeof update !== 'string') throw `update must be a string but ${typeof update} provided`;

  const ordersCollection = await orders();
  const updateInfo = await ordersCollection.updateOne({ _id: ObjectId(id) }, { $push: {updates: update} });

  if (updateInfo.modifiedCount === 0) {
    throw `Could not update order with id ${id}`;
  }
}

async function updateStatus(id, status) {
  if (typeof id !== 'string') throw `id must be a string but ${typeof id} provided`;
  if (typeof status !== 'string') throw `status must be a string but ${typeof status} provided`;

  const ordersCollection = await orders();
  const updateInfo = await ordersCollection.updateOne({ _id: ObjectId(id) }, { $set: {status: status} });

  if (updateInfo.modifiedCount === 0) {
    throw `Could not update order with id ${id}`;
  }
}

async function remove(id) {
  if (typeof id !== 'string') throw `id must be a string but ${typeof id} provided`;

  const ordersCollection = await orders();
  const deletionInfo = await ordersCollection.removeOne({ _id: ObjectId(id) });

  if (deletionInfo.deletedCount === 0) {
    throw `Could not delete order with id of ${id}`;
  }
}

async function aggregateOrders() {

  const ordersCollection = await orders();
  // Count all occurrences a product was bought through the DB. Ideally this would be cached in an application at scale. 
  const data = await ordersCollection.aggregate([
              {$project: {"_id": false, "items":true}}, 
              {$unwind: "$items"},  
              {$group: {_id: '$items', count: { $sum : 1} }}
              ])
              .toArray()
  // As toArray does not allow pretty chaining, allow for the await to finish and collect the value before reducing. 
  return mongoOperations.resultsToSet(data, "_id", "count");
}

module.exports = {
  get,
  create,
  addUpdate,
  updateStatus,
  remove,
  aggregateOrders
};
