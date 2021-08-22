const express = require("express");
const router = express.Router();

const productData = require("../data/products");
const reviewData = require("../data/reviews");
const metrics = require("../data/metrics");
const productSchema = require("../schemas/new_product");

router.get("/:slug", async (req, res) => {
    const product = await productData.getBySlug(req.params.slug);
    product.isLowStock = product.stock < 5;
    metrics.notifyProductPageView(model._id);

    const reviews = await reviewData.getByProductId(product._id);
    res.render("pages/product", {...product, user: req.session.user, reviews, partial: 'review-scripts'});

});

router.patch("/:id", async (req, res) => {
    // Leave the slug not updated, as that is part of the url and customers may have had it bookmarked.
    delete req.body.slug;

    // If id is null, the route selector will not match
    const id = req.params.id
    const product = await data.get(id);

    if(product == null) {
        res.status(404).json({message: "Specified object not found"});
        return
    }
    // Overwrite any fields the client specified, and drop the mongo id from the object
    const updated = Object.assign({}, product, req.body);
    delete updated._id;

    // Trim whitespace from users for otherwise valid tags
    updated.tags = updated.tags.map (tag => tag.trim());

    // After merging changes, now validate objects as all user mutations were applied. 
    const { error, value: validatedProduct } = productSchema.validate(updated);
    if (error) {
        console.error(`Validation failed on patch for ${id}! ${error}`);
        let msg = `Validation error: ${error.details.map(x => x.message).join(', ')}`;
        res.status(400).json({error: msg});
        return
    }

    try {
        await data.update(id, validatedProduct);
        res.status(204).json({});
    } catch (e){
        console.error(e);
        res.status(500).json({"message": "Internal error applying update"});
    }
});

module.exports = router;
