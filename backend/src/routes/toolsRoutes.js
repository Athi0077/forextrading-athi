const express = require('express');
const router = express.Router();
const { 
  getWatchlist, 
  updateWatchlist, 
  getAlerts, 
  createAlert, 
  updateAlert, 
  deleteAlert
} = require('../controllers/toolsController');
const protect = require('../middleware/authMiddleware');

router.use(protect);

// Watchlist routes
router.route('/watchlist')
  .get(getWatchlist)
  .put(updateWatchlist);

// Price Alerts routes
router.route('/alerts')
  .get(getAlerts)
  .post(createAlert);

router.route('/alerts/:id')
  .put(updateAlert)
  .delete(deleteAlert);

module.exports = router;
