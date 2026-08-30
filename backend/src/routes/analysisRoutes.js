const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getAnalysis } = require('../controllers/analysisController');

router.get('/', authMiddleware, getAnalysis);

module.exports = router;
