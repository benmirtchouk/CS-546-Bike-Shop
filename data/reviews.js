const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const reviews = mongoCollections.reviews;
const users = require('./users');
const products = require('./products');
const new_review_schema = require('../schemas/new_review');

async function get(id) {
  if (typeof id !== 'string') throw `id must be a string but ${typeof id} provided`;

  const reviewsCollection = await reviews();
  let review = await reviewsCollection.findOne({ _id: ObjectId(id) });

  if (review !== null) {
    review._id = review._id.toString();
    review.owner = review.owner.toString();
    review.product = review.product.toString();
  }

  return review;
}

async function getByProductId(id) {
  if (typeof id !== 'string') throw `id must be a string but ${typeof id} provided`;

  const reviewsCollection = await reviews();
  let product_reviews = await reviewsCollection.find({ product: ObjectId(id) }).toArray();

  product_reviews = product_reviews.map((review) => {
    review._id = review._id.toString();
    review.owner = review.owner.toString();
    review.product = review.product.toString();
    return review;
  });

  return product_reviews;
}

async function create(review_data) {
  const { error, value: review } = new_review_schema.validate(review_data, {abortEarly: false, allowUnknown: true, stripUnknown: true});
  if (error) throw error.details.map(x => x.message).join(', ');

  const owner = await users.get(review.owner);
  if (owner === null) throw `no user with id ${review.owner}`;

  const product = await products.get(review.product);
  if (product === null) throw `no product with id ${review.product}`;

  review.owner = ObjectId(review.owner);
  review.product = ObjectId(review.product);
  if (review.verified === undefined) review.verified = false;
  if (review.pictures === undefined) review.pictures = [];
  review.likes = 0;
  review.dislikes = 0;
  review.likers = [];
  review.dislikers = [];
  review.comments = [];

  const reviewsCollection = await reviews();
  const insertInfo = await reviewsCollection.insertOne(review);
  if (insertInfo.insertedCount === 0) throw 'Could not add new review';

  let inserted = insertInfo.ops[0];
  inserted._id = inserted._id.toString();
  inserted.owner = inserted.owner.toString();
  inserted.product = inserted.product.toString();

  return inserted;
}

async function like(userid, reviewid) {
  if (typeof userid !== 'string') throw `userid must be a string but ${typeof userid} provided`;
  if (typeof reviewid !== 'string') throw `reviewid must be a string but ${typeof reviewid} provided`;

  const user = await users.get(userid);
  if (user === null) throw `no user with id ${userid}`;
  const review = await this.get(reviewid);
  if (review === null) throw `no review with id ${reviewid}`;

  let updateData = {
    '$inc': {'likes': 1},
    '$push': { 'likers': userid }
  };

  if (review.likers.indexOf(userid) != -1) return review;
  if (review.dislikers.indexOf(userid) != -1) {
    updateData['$inc']['dislikes'] = -1;
    updateData['$pull'] = { 'dislikers': userid };
  }

  const reviewsCollection = await reviews();
  const updateInfo = await reviewsCollection.updateOne({ _id: ObjectId(reviewid) }, updateData);

  if (updateInfo.modifiedCount === 0) {
    throw `Could not update review with id ${reviewid}`;
  }

  return this.get(reviewid);
}

async function dislike(userid, reviewid) {
  if (typeof userid !== 'string') throw `userid must be a string but ${typeof userid} provided`;
  if (typeof reviewid !== 'string') throw `reviewid must be a string but ${typeof reviewid} provided`;

  const user = await users.get(userid);
  if (user === null) throw `no user with id ${userid}`;
  const review = await this.get(reviewid);
  if (review === null) throw `no review with id ${reviewid}`;

  let updateData = {
    '$inc': {'dislikes': 1},
    '$push': { 'dislikers': userid }
  };

  if (review.dislikers.indexOf(userid) != -1) return review;
  if (review.likers.indexOf(userid) != -1) {
    updateData['$inc']['likes'] = -1;
    updateData['$pull'] = { 'likers': userid };
  }
  
  const reviewsCollection = await reviews();
  const updateInfo = await reviewsCollection.updateOne({ _id: ObjectId(reviewid) }, updateData);

  if (updateInfo.modifiedCount === 0) {
    throw `Could not update review with id ${reviewid}`;
  }

  return this.get(reviewid);
}

async function addComment(reviewid, comment) {
  if (typeof reviewid !== 'string') throw `reviewid must be a string but ${typeof reviewid} provided`;
  if (typeof comment !== 'string') throw `comment must be a string but ${typeof comment} provided`;
  if (comment.length == 0) throw "comment must not be empty.";

  const reviewsCollection = await reviews();
  const updateInfo = await reviewsCollection.updateOne({ _id: ObjectId(reviewid) }, { $push: {'comments': comment} });

  if (updateInfo.modifiedCount === 0) {
    throw `Could not update review with id ${reviewid}`;
  }

  return comment;
}

async function remove(id) {
  if (typeof id !== 'string') throw `id must be a string but ${typeof id} provided`;
  
  const reviewsCollection = await reviews();
  const deletionInfo = await reviewsCollection.removeOne({ _id: ObjectId(id) });

  if (deletionInfo.deletedCount === 0) {
    throw `Could not delete review with id of ${id}`;
  }
}

module.exports = {
  get,
  getByProductId,
  create,
  like,
  dislike,
  remove,
  addComment,
};
