const mongoose = require('mongoose');

const aiUsageSchema = new mongoose.Schema({
  totalRequests: {
    type: Number,
    default: 0,
  },
  todayRequests: {
    type: Number,
    default: 0,
  },
  recentErrors: {
    type: Number,
    default: 0,
  },
  settings: {
    isEnabled: {
      type: Boolean,
      default: true,
    },
    limitPerUser: {
      type: Number,
      default: 50,
    }
  },
  lastResetDate: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('AIUsage', aiUsageSchema);
