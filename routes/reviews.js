const express = require("express");
const router = express.Router();
const productData = require("../data/products");
const reviewData = require("../data/reviews");
const { ObjectId } = require('mongodb');

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

module.exports = router;
