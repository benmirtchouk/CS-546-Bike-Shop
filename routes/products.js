const express = require("express");
const router = express.Router();

const productData = require("../data/products");
const reviewData = require("../data/reviews");
const metrics = require("../data/metrics");
const productSchema = require("../schemas/new_product");
const authHelper = require("../middleware/authentication");
const slugify = require('slugify');

router.get("/:slug", async (req, res) => {

    // TODO handle null case
    const product = await productData.getBySlug(req.params.slug);
    if(product == null) {
        res.status(404).json({"message": "No product found for that name!"});
        return;
    }
    product.isOutOfStock = product.stock <= 0;
    product.isLowStock = product.stock < 5 && !product.isOutOfStock;
    metrics.notifyProductPageView(product._id);

    const reviews = await reviewData.getByProductId(product._id);
    res.render("pages/product", {...product, user: req.session.user, reviews, partial: 'review-scripts'});

});

router.put("/", async (req,res) => {
    if (authHelper.getUserIfAdmin(req) == null) {
        authHelper.endRequestDueToBeingUnauthorized(res);
        return
    }
    if (!req.body.name || typeof req.body.name !== 'string') {
        res.status(400).json({message: "Name must be specified"});
        return;
    }
    req.body.slug = slugify(req.body.name, {lower: true})
    req.body.pictures = ['/images/no_image.jpg']

    const { error, value: validatedProduct } = productSchema.validate(req.body);
    if (error) {
        console.error(`Validation failed on put for ${req.body.name}! ${error}`);
        let msg = `Validation error: ${error.details.map(x => x.message).join(', ')}`;
        res.status(400).json({message: msg});
        return
    }

    try {
        await productData.create(validatedProduct);
        res.status(204).json({});
    } catch (e){
        console.error(e);
        const status = typeof e == 'string' && e.startsWith("Slug already in use") ? 400 : 500;
        const message = status == 400 ? e : "Internal error applying update"
        res.status(status).json({"message": message});
    }

})

router.patch("/:id", async (req, res) => { 
    if (authHelper.getUserIfAdmin(req) == null) {
        authHelper.endRequestDueToBeingUnauthorized(res);
        return
    }
    // Leave the slug not updated, as that is part of the url and customers may have had it bookmarked.
    delete req.body.slug;

    // If id is null, the route selector will not match
    const id = req.params.id
    const product = await productData.get(id);

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
        res.status(400).json({message: msg});
        return
    }

    try {
        await productData.update(id, validatedProduct);
        res.status(204).json({});
    } catch (e){
        console.error(e);
        res.status(500).json({"message": "Internal error applying update"});
    }
});

router.delete("/:id", async (req, res) => { 
    if (authHelper.getUserIfAdmin(req) == null) {
        authHelper.endRequestDueToBeingUnauthorized(res);
        return
    }

    // If id is null, route will not be dispatched
    const id = req.params.id;
    const product = await productData.get(id)
    if(!product) {{
        res.status(404).json({message: "Product not found!"});
        return
    }}

    try {
        await productData.remove(req.params.id)
        res.status(204).json({});
    } catch (e) {
        console.error(e);
        res.status(500).json({message: "Internal error handling delete"})
    }
    
});

module.exports = router;
