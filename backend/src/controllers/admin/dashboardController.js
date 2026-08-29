const User = require('../../models/User');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const onlineUsers = await User.countDocuments({ isOnline: true });
    
    // Active users in the last 7 days
    const activeThreshold = new Date();
    activeThreshold.setDate(activeThreshold.getDate() - 7);
    const activeUsers = await User.countDocuments({ lastSeen: { $gte: activeThreshold } });

    // New users in the last 24 hours
    const newThreshold = new Date();
    newThreshold.setHours(newThreshold.getHours() - 24);
    const newUsers = await User.countDocuments({ createdAt: { $gte: newThreshold } });

    const premiumUsers = await User.countDocuments({ isPremium: true });

    // Fetch real trade stats from Trade model
    const Trade = require('../../models/Trade');
    
    const tradeStats = await Trade.aggregate([
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

    const tStats = tradeStats.length > 0 ? tradeStats[0] : {
      totalTrades: 0, openTrades: 0, closedTrades: 0, 
      winningTrades: 0, losingTrades: 0, totalProfit: 0, totalLoss: 0, netPnl: 0
    };

    // In a real scenario, fetch AI Requests and Revenue from respective models
    const totalAiRequests = 0; // Placeholder
    const revenue = 0; // Placeholder

    res.json({
      success: true,
      data: {
        totalUsers,
        onlineUsers,
        activeUsers,
        newUsers,
        premiumUsers,
        tradeStats: tStats,
        totalAiRequests,
        revenue,
        apiStatus: 'Operational'
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

module.exports = {
  getDashboardStats
};
