const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { processChatMessage } = require('../controllers/aiController');

router.post('/chat', authMiddleware, processChatMessage);

module.exports = router;
