const express = require("express");
const router = express.Router();
const productData = require("../data/products");
const reviewData = require("../data/reviews");
const { ObjectId } = require('mongodb');
const xss = require('../config/xss');

router.get("/like/:id", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({error: 'Must be logged in to rate reviews.'});
    }

    let reviewid = req.params.id;
    try {
      if (typeof reviewid !== 'string')
        throw 'reviewid must be a string';
      let oid = ObjectId(reviewid);
    } catch (e) {
      return res.json({ error: 'reviewid must be a valid id string' });
    }

    const old_review = await reviewData.get(reviewid);
    if (old_review === null) {
      return res.json({ error: `no review with id ${reviewid}` });
    }

    const { likes, dislikes } = await reviewData.like(req.session.user._id, reviewid);
    res.json({ review: {likes, dislikes} });
  } catch(e) {
    res.status(500).send();
  }
});

router.get("/dislike/:id", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({error: 'Must be logged in to rate reviews.'});
    }

    let reviewid = req.params.id;
    try {
      if (typeof reviewid !== 'string')
        throw 'reviewid must be a string';
      let oid = ObjectId(reviewid);
    } catch (e) {
      return res.json({ error: 'reviewid must be a valid id string' });
    }

    const old_review = await reviewData.get(reviewid);
    if (old_review === null) {
      return res.json({ error: `no review with id ${reviewid}` });
    }

    const { likes, dislikes } = await reviewData.dislike(req.session.user._id, reviewid);
    res.json({ review: {likes, dislikes} });
  } catch(e) {
    res.status(500).send();
  }
});


router.post("/add", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({error: 'Must be logged in to post a review.'});
    }

    let productid = req.body.productid;
    let rating = req.body.rating.trim();
    let review_body = xss(req.body.body.trim());

    try {
      if (typeof productid !== 'string')
        throw 'productid must be a string';
      let oid = ObjectId(productid);
    } catch (e) {
      return res.json({ error: 'productid must be a valid id string' });
    }

    const product = await productData.get(productid);
    if (product === null) {
      return res.json({ error: `no product with id ${productid}` });
    }

    try {
      if (rating.length == 0 || isNaN(rating)) throw 'rating must be an integer';
      rating = parseInt(rating);
      if (rating < 1 || rating > 5) throw 'rating must be between 1 and 5.'
    } catch (e) {
      return res.json({ error: 'rating must be a valid integer between 1 and 5' });
    }

    if (review_body.length == 0) {
      return res.json({ error: 'Review body must be non-empty.' });
    }

    let review = await reviewData.create({
      owner: req.session.user._id,
      product: productid,
      rating: rating, 
      body: review_body
    });

    res.redirect(`/bikes/${req.body.slug}`);
  } catch(e) {
    res.status(500).send();
  }
});

module.exports = router;
