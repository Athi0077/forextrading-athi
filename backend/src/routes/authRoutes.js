const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getMe, heartbeat } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', authMiddleware, logoutUser);
router.get('/me', authMiddleware, getMe);
router.post('/heartbeat', authMiddleware, heartbeat);

module.exports = router;
