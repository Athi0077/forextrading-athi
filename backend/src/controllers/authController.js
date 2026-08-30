const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name, email and password are required' } });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, error: { code: 'USER_EXISTS', message: 'Email is already registered' } });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: password
    });

    res.status(201).json({
      success: true,
      data: {
        token: generateToken(user._id),
        user: { id: user._id, name: user.name, email: user.email, role: user.role, balance: user.balance, themePreferences: user.themePreferences }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_FAILED', message: 'Invalid email or password.' } });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, error: { code: 'ACCOUNT_BLOCKED', message: 'This account has been blocked.' } });
    }

    user.lastLoginAt = new Date();
    user.lastSeen = new Date();
    user.isOnline = true;
    await user.save();

    res.json({
      success: true,
      data: {
        token: generateToken(user._id),
        user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, balance: user.balance, themePreferences: user.themePreferences }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

const logoutUser = async (req, res) => {
  try {
    if (req.user && req.user.id) {
      await User.findByIdAndUpdate(req.user.id, { isOnline: false, lastSeen: new Date() });
    }
  } catch (error) {
    console.error('Logout tracking error:', error);
  }
  // For JWT, logout is typically handled client-side by destroying the token
  res.json({ success: true, data: { message: 'Logged out successfully' } });
};

const heartbeat = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false });
    }
    await User.findByIdAndUpdate(req.user.id, { isOnline: true, lastSeen: new Date() });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Heartbeat failed' } });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
    res.json({
      success: true,
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, balance: user.balance, createdAt: user.createdAt, themePreferences: user.themePreferences } }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  heartbeat
};
