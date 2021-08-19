const express = require("express");
const router = express.Router();
const data = require("../data/products");

router.get("/:slug", async (req, res) => {
    const model = await data.getBySlug(req.params.slug);
    res.render("layouts/product", model);
});

module.exports = router;
