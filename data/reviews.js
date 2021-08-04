const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const reviews = mongoCollections.reviews;
const users = require('./users');
const products = require('./products');

async function get(id) {
  const reviewsCollection = await reviews();
  let review = await reviewsCollection.findOne({ _id: ObjectId(id) });

  if (review !== null) {
    review._id = review._id.toString();
    review.owner = review.owner.toString();
    review.product = review.product.toString();
  }

  return review;
}

async function create(review) {
  const owner = users.get(review.owner);
  if (owner === null) throw `no user with id ${review.owner}`;

  const product = products.get(review.product);
  if (product === null) throw `no product with id ${review.product}`;

  const newReview = {
    'owner': ObjectId(review.owner),
    'product': ObjectId(review.product),
    'verified': review.verified, //TODO, do we need to automate the verification process?
    'rating': review.rating,
    'likes': 0,
    'dislikes': 0,
    'body': review.body,
    'pictures': review.pictures,
  };

  const reviewsCollection = await reviews();
  const insertInfo = await reviewsCollection.insertOne(newReview);
  if (insertInfo.insertedCount === 0) throw 'Could not add new review';

  let inserted = insertInfo.ops[0];
  inserted._id = inserted.owner.toString();
  inserted.owner = inserted.owner.toString();
  inserted.product = inserted.owner.toString();

  return inserted;
}

async function update(id, review) {
  const reviewsCollection = await reviews();
  const updateInfo = await reviewsCollection.updateOne({ _id: ObjectId(id) }, { $set: review });

  if (updateInfo.modifiedCount === 0) {
    throw `Could not update review with id ${id}`;
  }
}

async function like(id) {
  const reviewsCollection = await reviews();
  const updateInfo = await reviewsCollection.updateOne({ _id: ObjectId(id) }, { $inc: 'likes' });

  if (updateInfo.modifiedCount === 0) {
    throw `Could not update review with id ${id}`;
  }
}

async function dislike(id) {
  const reviewsCollection = await reviews();
  const updateInfo = await reviewsCollection.updateOne({ _id: ObjectId(id) }, { $inc: 'dislikes' });
  
  if (updateInfo.modifiedCount === 0) {
    throw `Could not update review with id ${id}`;
  }
}

async function remove(id) {
  const reviewsCollection = await reviews();
  const deletionInfo = await reviewsCollection.removeOne({ _id: ObjectId(id) });

  if (deletionInfo.deletedCount === 0) {
    throw `Could not delete review with id of ${id}`;
  }
}

module.exports = {
  get,
  create,
  update,
  remove,
};
