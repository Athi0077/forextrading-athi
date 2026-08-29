const express = require('express');
const router = express.Router();
const { 
  getTrades, 
  createTrade, 
  updateTrade, 
  deleteTrade, 
  getPortfolioAnalytics,
  getPerformanceInsight
} = require('../controllers/tradeController');
const protect = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getTrades)
  .post(createTrade);

router.route('/analytics')
  .get(getPortfolioAnalytics);

router.route('/insight')
  .get(getPerformanceInsight);

router.route('/:id')
  .put(updateTrade)
  .delete(deleteTrade);

module.exports = router;
