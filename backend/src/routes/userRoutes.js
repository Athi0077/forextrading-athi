const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMe, updateMe, updatePassword } = require('../controllers/userController');

router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);
router.put('/password', authMiddleware, updatePassword);

module.exports = router;
