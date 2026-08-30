const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const announcementController = require('../controllers/announcementController');

router.use(authMiddleware);

router.get('/active', announcementController.getActiveAnnouncements);

module.exports = router;
