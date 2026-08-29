const express = require('express');
const router = express.Router();
const { 
  getTrades,
  getTradeById, 
  createTrade, 
  updateTrade, 
  deleteTrade,
  closeTrade, 
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
  .get(getTradeById)
  .put(updateTrade)
  .delete(deleteTrade);

router.route('/:id/close')
  .put(closeTrade);

module.exports = router;
