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
