const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    index: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  timeframes: {
    '15m': mongoose.Schema.Types.Mixed,
    '5m': mongoose.Schema.Types.Mixed,
    '1m': mongoose.Schema.Types.Mixed
  },
  finalSignal: {
    type: String,
    enum: ['BUY', 'SELL', 'WAIT'],
    required: true
  },
  signalConfidence: Number,
  entry: Number,
  entryZone: [Number],
  stopLoss: Number,
  takeProfit1: Number,
  takeProfit2: Number,
  riskRewardRatio: Number,
  riskLevel: String,
  reasons: [String],
  warnings: [String],
  source: {
    type: String,
    default: 'technical-analysis-engine'
  },
  analyzedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);
