const Watchlist = require('../models/Watchlist');
const PriceAlert = require('../models/PriceAlert');

// Get Watchlist
const getWatchlist = async (req, res, next) => {
  try {
    let watchlist = await Watchlist.findOne({ userId: req.user._id });
    if (!watchlist) {
      watchlist = await Watchlist.create({ userId: req.user._id, pairs: [] });
    }
    res.json({ success: true, data: watchlist });
  } catch (error) {
    next(error);
  }
};

// Update Watchlist (add/remove pairs)
const updateWatchlist = async (req, res, next) => {
  try {
    const { pairs } = req.body;
    if (!Array.isArray(pairs)) {
      return res.status(400).json({ success: false, error: { message: 'Pairs must be an array' } });
    }
    
    let watchlist = await Watchlist.findOneAndUpdate(
      { userId: req.user._id },
      { pairs },
      { new: true, upsert: true }
    );
    
    res.json({ success: true, data: watchlist });
  } catch (error) {
    next(error);
  }
};

// Get Alerts
const getAlerts = async (req, res, next) => {
  try {
    const alerts = await PriceAlert.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

// Create Alert
const createAlert = async (req, res, next) => {
  try {
    const alertData = { ...req.body, userId: req.user._id };
    const alert = await PriceAlert.create(alertData);
    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// Update Alert (status, targetPrice, etc)
const updateAlert = async (req, res, next) => {
  try {
    const alert = await PriceAlert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!alert) {
      return res.status(404).json({ success: false, error: { message: 'Alert not found' } });
    }
    
    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// Delete Alert
const deleteAlert = async (req, res, next) => {
  try {
    const alert = await PriceAlert.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!alert) {
      return res.status(404).json({ success: false, error: { message: 'Alert not found' } });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWatchlist,
  updateWatchlist,
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert
};
