const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const products = mongoCollections.products;
const productSchema = require('../schemas/new_product');

async function get(id) {
  if (typeof id !== 'string') throw `id must be a string but ${typeof id} provided`;

  const productsCollection = await products();
  const product = await productsCollection.findOne({ _id: ObjectId(id) });

  if (product !== null) {
    product._id = product._id.toString();
  }

  return product;
}

async function getBySlug(slug) {
  if (typeof slug !== 'string') throw `slug must be a string but ${typeof slug} provided`;

  const productsCollection = await products();
  const product = await productsCollection.findOne({ slug: slug });

  if (product !== null) {
    product._id = product._id.toString();
  }

  return product;
}

async function create(productData) {
  const { error, value: product } = productSchema.validate(productData);
  if (error) {
    throw error
  }

  const existing = await getBySlug(product.slug);
  if (existing) { throw "Slug already in use, product cannot be created with this name. Try a new name or adding a number at the end!" }
  const productsCollection = await products();
  const insertInfo = await productsCollection.insertOne(product);
  if (insertInfo.insertedCount === 0) throw 'Could not add new product';

  const new_product = insertInfo.ops[0];
  new_product._id = new_product._id.toString();
  return new_product;
}

async function update(id, productData) {
  if (typeof id !== 'string') throw `id must be a string but ${typeof id} provided`;
  const { error, value: product } = productSchema.validate(productData);
  if (error) {
      throw error
  }
  const productsCollection = await products();
  const updateInfo = await productsCollection.updateOne({ _id: ObjectId(id) }, { $set: product });
  if (updateInfo.modifiedCount === 0) {
    throw `Could not update product with id ${id}`;
  }
}

async function remove(id) {
  if (typeof id !== 'string') throw `id must be a string but ${typeof id} provided`;
  const productsCollection = await products();
  const deletionInfo = await productsCollection.removeOne({ _id: ObjectId(id) });

  if (deletionInfo.deletedCount === 0) {
    throw `Could not delete product with id of ${id}`;
  }
}

async function getbyName(name){
  if (typeof name !== 'string') throw `name must be a string but ${typeof name} provided`;
  //adding helper func to filter by name
  const productsCollection = await products();
  const product = await productsCollection.findOne({ name: name });

  if (product !== null) {
    product._id = product._id.toString();
  }

  return product;
}

async function getAllUpTo(limit){

  if(!Number.isInteger(limit) || limit < 1) { throw "Invalid limit specified" }
  const productsCollection = await products();
  const productList = await productsCollection.find({}).limit(limit).toArray();

  productList.forEach( product => product._id = product._id.toString())

  return productList;
}

async function updateStock(id, latestStock){
  if (typeof id !== 'string') throw `id must be a string but ${typeof id} provided`;
  if(!Number.isInteger(latestStock) || latestStock < 0) { throw "Invalid new stock specified"; }

  //helper func to update stock
  const productsCollection = await products();
  const updateInfo = await productsCollection.updateOne({ _id: ObjectId(id) }, { $set: {stock:latestStock} });

  if (updateInfo.modifiedCount === 0) {
    throw `Could not update product with id ${id}`;
  }  
}

async function getAllInStock(){

  const productsCollection = await products();
  const productList = await productsCollection.find({stock : {$gt:0}}).toArray();

  productList.map( product => product._id = product._id.toString())

  return productList;
}

async function getAllTags() {
  const productsCollection = await products();
  const productList = await productsCollection.find({}).toArray();

  let s = new Set();
  productList.forEach(({tags}) => {
    tags.forEach(tag => s.add(tag));
  });

  return [...s];
}

module.exports = {
  get,
  getBySlug,
  getAllUpTo,
  create,
  update,
  remove,
  getbyName,
  updateStock,
  getAllInStock,
  getAllTags
};
