const Trade = require('../../models/Trade');

const getAllTrades = async (req, res) => {
  try {
    const { page = 1, limit = 50, user, pair, type, status } = req.query;
    
    let query = {};
    if (user) query.userId = user;
    if (pair) query.pair = new RegExp(pair, 'i');
    if (type) query.type = type;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const trades = await Trade.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Trade.countDocuments(query);

    res.json({
      success: true,
      data: trades,
      meta: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching admin trades:', error);
    res.status(500).json({ success: false, error: { message: 'Server error fetching trades' } });
  }
};

const getUserTradeSummary = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Aggregate trade statistics for this user
    const stats = await Trade.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalTrades: { $sum: 1 },
          openTrades: { $sum: { $cond: [{ $eq: ['$status', 'OPEN'] }, 1, 0] } },
          closedTrades: { $sum: { $cond: [{ $eq: ['$status', 'CLOSED'] }, 1, 0] } },
          winningTrades: { $sum: { $cond: [{ $gt: ['$pnl', 0] }, 1, 0] } },
          losingTrades: { $sum: { $cond: [{ $lt: ['$pnl', 0] }, 1, 0] } },
          totalProfit: { $sum: { $cond: [{ $gt: ['$pnl', 0] }, '$pnl', 0] } },
          totalLoss: { $sum: { $cond: [{ $lt: ['$pnl', 0] }, '$pnl', 0] } },
          netPnl: { $sum: '$pnl' }
        }
      }
    ]);

    const summary = stats.length > 0 ? stats[0] : {
      totalTrades: 0,
      openTrades: 0,
      closedTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalProfit: 0,
      totalLoss: 0,
      netPnl: 0
    };

    if (summary.closedTrades > 0) {
      summary.winRate = (summary.winningTrades / summary.closedTrades) * 100;
    } else {
      summary.winRate = 0;
    }

    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching user trade summary:', error);
    res.status(500).json({ success: false, error: { message: 'Server error fetching trade summary' } });
  }
};

module.exports = {
  getAllTrades,
  getUserTradeSummary
};
