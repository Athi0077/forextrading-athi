const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMarketData } = require('../controllers/marketController');

router.get('/candles', authMiddleware, getMarketData);

module.exports = router;
