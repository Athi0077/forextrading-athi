const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  entryPrice: {
    type: Number,
    required: true
  },
  exitPrice: {
    type: Number,
    default: null
  },
  lotSize: {
    type: Number,
    required: true
  },
  stopLoss: {
    type: Number,
    default: null
  },
  takeProfit: {
    type: Number,
    default: null
  },
  pnl: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED'],
    default: 'OPEN'
  },
  entryDate: {
    type: Date,
    default: Date.now
  },
  exitDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  screenshotUrl: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Pre-save hook to automatically set status to CLOSED if exitPrice and exitDate exist
tradeSchema.pre('save', function(next) {
  if (this.exitPrice && this.exitDate) {
    this.status = 'CLOSED';
    
    // Auto calculate PnL if not provided explicitly
    if (!this.pnl && this.pnl !== 0) {
      // Basic PnL estimation based on standard lots (this is a rough estimate for the journal)
      // Usually PnL would be passed directly from the frontend calculator to avoid precision issues
      const pipValue = 10;
      const diff = this.type === 'BUY' 
        ? (this.exitPrice - this.entryPrice) 
        : (this.entryPrice - this.exitPrice);
      
      this.pnl = diff * pipValue * this.lotSize * 10; 
    }
  } else if (!this.exitPrice || !this.exitDate) {
    this.status = 'OPEN';
  }
  next();
});

module.exports = mongoose.model('Trade', tradeSchema);
