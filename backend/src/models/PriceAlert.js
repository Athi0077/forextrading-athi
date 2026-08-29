const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  pair: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  condition: {
    type: String,
    enum: ['ABOVE', 'BELOW'],
    required: true
  },
  targetPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'TRIGGERED', 'DISABLED'],
    default: 'ACTIVE'
  },
  triggeredAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
