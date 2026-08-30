const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    default: 'XAU/USD'
  },
  signal: {
    type: String,
    enum: ['BUY', 'SELL', 'WAIT', null],
    default: null
  },
  analysis: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  tradePlan: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  warnings: {
    type: [String],
    default: []
  },
  showTradePlan: {
    type: Boolean,
    default: false
  },
  isError: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Ensure messages are returned in chronological order by default
messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
