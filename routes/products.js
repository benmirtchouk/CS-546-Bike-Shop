const express = require("express");
const router = express.Router();
const productData = require("../data/products");
const reviewData = require("../data/reviews");

router.get("/:slug", async (req, res) => {
    const product = await productData.getBySlug(req.params.slug);
    product.isLowStock = product.stock < 5;

    const reviews = await reviewData.getByProductId(product._id);
    res.render("pages/product", {...product, user: req.session.user, reviews, partial: 'review-scripts'});
});

module.exports = router;
