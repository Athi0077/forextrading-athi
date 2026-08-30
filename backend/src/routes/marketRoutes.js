const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMarketData, getMarketQuotes } = require('../controllers/marketController');

router.get('/candles', authMiddleware, getMarketData);
router.get('/quotes', authMiddleware, getMarketQuotes);

module.exports = router;
