const express = require('express');
const router = express.Router();

router.post("/register", async(req, res) => {
    res.status(500).json({message: "Not Implemented"})
})

router.post("/login", async(req, res) => {
    res.status(500).json({message: "Not Implemented"})
})

module.exports = router;