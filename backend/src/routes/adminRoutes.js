const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const dashboardController = require('../controllers/admin/dashboardController');
const userController = require('../controllers/admin/userController');

// All admin routes must be authenticated and authorized
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard stats
router.get('/dashboard', dashboardController.getDashboardStats);

// User Management
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserDetails);
router.put('/users/:id/status', userController.updateUserStatus);
router.put('/users/:id/role', userController.updateUserRole);
router.delete('/users/:id', userController.deleteUser);

// Placeholder routes for Phase 1 - to be implemented fully later if needed
router.get('/activity', (req, res) => res.json({ success: true, data: [] }));
router.get('/api-status', (req, res) => res.json({ success: true, data: { status: 'OK' } }));
router.get('/ai', (req, res) => res.json({ success: true, data: { totalRequests: 0 } }));
router.get('/subscriptions', (req, res) => res.json({ success: true, data: [] }));
router.get('/payments', (req, res) => res.json({ success: true, data: [] }));
router.get('/support', (req, res) => res.json({ success: true, data: [] }));
router.get('/announcements', (req, res) => res.json({ success: true, data: [] }));
router.post('/announcements', (req, res) => res.json({ success: true, data: {} }));

module.exports = router;
