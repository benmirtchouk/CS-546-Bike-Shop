const express = require('express');
const router = express.Router();
const new_user_schema = require('../schemas/new_user');
const usersData = require('../data/users');
const productData = require("../data/products");
const bcrypt = require('bcrypt');
const {ObjectId} = require('mongodb');

router.get("/cart", async (req, res) => {
    try {
        if (!req.session.user)
            return res.json({error: 'Must be logged in to view cart.'});
        const cartIds = await usersData.getCart(req.session.user._id);

        let cart = [];
        for (let i = 0; i < cartIds.length; i++)
            cart[i] = await productData.get(cartIds[i]);

        res.render("pages/cart", {cart, user: req.session.user});
    } catch (e) {
        return res.json({error: e});
    }
})

router.post("/cart/:id", async (req, res) => {
    try {
        if (!req.session.user)
            return res.json({error: 'Must be logged in add to cart.'});
        let productId = req.params.id;
        if (typeof productId !== 'string')
            return res.json({error: 'Invalid product ID. Must be string.'});
        await usersData.addToCart(req.session.user._id, productId);
        return res.redirect('/user/cart')
    } catch (e) {
        return res.json({error: e});
    }
})

router.post("/register", async (req, res) => {
    try {
        const {error, value: new_user} = new_user_schema.validate(req.body);
        if (error) {
            let msg = `Validation error: ${error.details.map(x => x.message).join(', ')}`;
            res.json({error: msg});
        } else {
            new_user.email = new_user.email.toLowerCase();

            let existing = await usersData.getByEmail(new_user.email);
            if (existing !== null) {
                res.json({error: "An account with this email already exists."});
            } else {
                // Ensure a user cannot inject themselves as an admin
                new_user.admin = false
                let user = await usersData.create(new_user);
                req.session.user = user;
                res.json({user});
            }
        }
    } catch (e) {
        res.status(500).send();
    }
})

router.get("/logout", async (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

router.post("/login", async (req, res) => {
    // try {
    if (typeof req.body.email !== 'string') return res.json({error: `Email must be a string but ${typeof req.body.email} provided`});
    if (typeof req.body.password !== 'string') return res.json({error: `Password must be a string but ${typeof req.body.password} provided`});

    let user = await usersData.getByEmail(req.body.email.toLowerCase());
    if (user === null) {
        return res.json({error: 'Invalid email or password provided'});
    }

    let match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
        return res.json({error: 'Invalid email or password provided'});
    }

    req.session.user = user;
    res.json({user});
    // } catch(e) {
    // res.status(500).send();
    // }
})

module.exports = router;