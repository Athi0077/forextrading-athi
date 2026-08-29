const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'Account',
      'Market Data',
      'AI Assistant',
      'Trade Journal',
      'Trading Tools',
      'Technical Issue',
      'Bug Report',
      'Other'
    ],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['OPEN', 'IN PROGRESS', 'RESOLVED', 'CLOSED'],
    default: 'OPEN'
  },
  supportReply: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
