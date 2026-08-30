const Trade = require('../models/Trade');
const { callOpenRouter } = require('../services/openRouterService');

// Get all trades for user
const getTrades = async (req, res, next) => {
  try {
    const trades = await Trade.find({ userId: req.user.id }).sort({ entryDate: -1 });
    res.json({ success: true, data: trades });
  } catch (error) {
    next(error);
  }
};

// Create new trade
const createTrade = async (req, res, next) => {
  try {
    const tradeData = { ...req.body, userId: req.user.id };
    const trade = await Trade.create(tradeData);
    res.status(201).json({ success: true, data: trade });
  } catch (error) {
    next(error);
  }
};

// Update trade
const updateTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!trade) {
      return res.status(404).json({ success: false, error: { message: 'Trade not found' } });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      trade[key] = req.body[key];
    });

    await trade.save(); // Triggers pre-save hook for PnL and status
    
    res.json({ success: true, data: trade });
  } catch (error) {
    next(error);
  }
};

// Delete trade
const deleteTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!trade) {
      return res.status(404).json({ success: false, error: { message: 'Trade not found' } });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// Get trade by ID
const getTradeById = async (req, res, next) => {
  try {
    const trade = await Trade.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trade) {
      return res.status(404).json({ success: false, error: { message: 'Trade not found' } });
    }
    res.json({ success: true, data: trade });
  } catch (error) {
    next(error);
  }
};

// Close trade
const closeTrade = async (req, res, next) => {
  try {
    const { exitPrice, exitDate } = req.body;
    
    if (!exitPrice && exitPrice !== 0) {
      return res.status(400).json({ success: false, error: { message: 'Exit price is required to close a trade' } });
    }

    const trade = await Trade.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!trade) {
      return res.status(404).json({ success: false, error: { message: 'Trade not found' } });
    }
    
    if (trade.status === 'CLOSED') {
      return res.status(400).json({ success: false, error: { message: 'Trade is already closed' } });
    }

    trade.exitPrice = Number(exitPrice);
    trade.exitDate = exitDate || new Date();
    
    await trade.save(); // This triggers the pre-save hook for PnL and status

    res.json({ success: true, data: trade });
  } catch (error) {
    next(error);
  }
};

// Portfolio Analytics
const getPortfolioAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Aggregation for basic stats
    const stats = await Trade.aggregate([
      { $match: { userId: req.user.id, status: 'CLOSED' } },
      {
        $group: {
          _id: null,
          totalTrades: { $sum: 1 },
          totalPnL: { $sum: '$pnl' },
          winningTrades: { $sum: { $cond: [{ $gt: ['$pnl', 0] }, 1, 0] } },
          losingTrades: { $sum: { $cond: [{ $lt: ['$pnl', 0] }, 1, 0] } },
          grossProfit: { $sum: { $cond: [{ $gt: ['$pnl', 0] }, '$pnl', 0] } },
          grossLoss: { $sum: { $cond: [{ $lt: ['$pnl', 0] }, '$pnl', 0] } },
        }
      }
    ]);

    const statsData = stats[0] || {
      totalTrades: 0,
      totalPnL: 0,
      winningTrades: 0,
      losingTrades: 0,
      grossProfit: 0,
      grossLoss: 0
    };

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayStats = await Trade.aggregate([
      { $match: { userId: req.user.id, status: 'CLOSED', exitDate: { $gte: startOfDay } } },
      { $group: { _id: null, todayPnL: { $sum: '$pnl' } } }
    ]);
    statsData.todayPnL = todayStats[0] ? todayStats[0].todayPnL : 0;
    
    statsData.openPositionsCount = await Trade.countDocuments({ userId: req.user.id, status: 'OPEN' });

    statsData.winRate = statsData.totalTrades > 0 ? (statsData.winningTrades / statsData.totalTrades) * 100 : 0;
    statsData.averageWin = statsData.winningTrades > 0 ? statsData.grossProfit / statsData.winningTrades : 0;
    statsData.averageLoss = statsData.losingTrades > 0 ? Math.abs(statsData.grossLoss / statsData.losingTrades) : 0;
    statsData.profitFactor = statsData.grossLoss !== 0 ? Math.abs(statsData.grossProfit / statsData.grossLoss) : (statsData.grossProfit > 0 ? 999 : 0);

    // Aggregation by Pair
    const byPair = await Trade.aggregate([
      { $match: { userId: req.user.id, status: 'CLOSED' } },
      {
        $group: {
          _id: '$pair',
          trades: { $sum: 1 },
          pnl: { $sum: '$pnl' },
          wins: { $sum: { $cond: [{ $gt: ['$pnl', 0] }, 1, 0] } }
        }
      },
      { $sort: { pnl: -1 } }
    ]);

    // Aggregation by Type (BUY/SELL)
    const byType = await Trade.aggregate([
      { $match: { userId: req.user.id, status: 'CLOSED' } },
      {
        $group: {
          _id: '$type',
          trades: { $sum: 1 },
          pnl: { $sum: '$pnl' },
          wins: { $sum: { $cond: [{ $gt: ['$pnl', 0] }, 1, 0] } }
        }
      }
    ]);
    
    // Equity Curve points
    const closedTrades = await Trade.find({ userId: req.user.id, status: 'CLOSED' }).sort({ exitDate: 1 });
    let cumulative = 0;
    const equityCurve = closedTrades.map(t => {
      cumulative += t.pnl;
      return {
        time: t.exitDate.getTime() / 1000,
        value: cumulative
      };
    });

    res.json({
      success: true,
      data: {
        stats: statsData,
        byPair,
        byType,
        equityCurve
      }
    });

  } catch (error) {
    next(error);
  }
};

// AI Performance Insight
const getPerformanceInsight = async (req, res, next) => {
  try {
    const recentTrades = await Trade.find({ userId: req.user.id, status: 'CLOSED' })
      .sort({ exitDate: -1 })
      .limit(20);
      
    if (recentTrades.length < 5) {
      return res.json({
        success: true,
        data: {
          insight: "Not enough data yet. Complete at least 5 trades to generate AI performance insights."
        }
      });
    }

    const tradeSummary = recentTrades.map(t => `${t.pair} ${t.type} PnL: $${t.pnl.toFixed(2)}`).join('; ');
    const totalPnL = recentTrades.reduce((acc, t) => acc + t.pnl, 0);

    const messages = [
      { role: 'user', content: `Analyze my last 20 trades and give me a 2-3 sentence performance insight. Tell me what I'm doing well or what pair/direction is failing. Keep it extremely concise and professional. Trades: ${tradeSummary}. Total PnL: $${totalPnL.toFixed(2)}` }
    ];

    try {
      const aiResponse = await callOpenRouter(messages, null);
      res.json({
        success: true,
        data: {
          insight: aiResponse.reason || "Your trading shows consistency, but maintain strict risk management on your losing pairs."
        }
      });
    } catch (aiError) {
      res.json({
        success: true,
        data: {
          insight: `You are up $${totalPnL.toFixed(2)} over your last ${recentTrades.length} trades. Keep monitoring your most active pairs for consistent setups.`
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrades,
  getTradeById,
  createTrade,
  updateTrade,
  deleteTrade,
  closeTrade,
  getPortfolioAnalytics,
  getPerformanceInsight
};
