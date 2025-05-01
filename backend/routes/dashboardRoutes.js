const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../models/dashboard');

router.get('/', async (req, res) => {
    try {
        const data = await getDashboardData();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;