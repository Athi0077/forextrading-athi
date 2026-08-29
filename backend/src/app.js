const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const dns = require("node:dns")
dns.setServers(['8.8.8.8', '8.8.4.4'])
 
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes'));
app.use('/api/market', require('./routes/marketRoutes'));
app.use('/api/analysis', require('./routes/analysisRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/trades', require('./routes/tradeRoutes'));
app.use('/api/tools', require('./routes/toolsRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: err.message || 'Internal server error'
    }
  });
});

module.exports = app;
