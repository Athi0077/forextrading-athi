const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: { message: 'Authentication required' } });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'User not found' } });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Access denied. Admin role required.' } });
    }

    // Attach full user object to request if needed by admin controllers
    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ success: false, error: { message: 'Server error in admin verification' } });
  }
};

module.exports = adminMiddleware;
