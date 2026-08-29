const { getCandles } = require('../services/twelveDataService');

const getMarketData = async (req, res, next) => {
  try {
    const { symbol, interval, outputsize = 100 } = req.query;
    
    if (!symbol) {
      return res.status(400).json({ success: false, error: 'Symbol parameter is required (e.g. XAU/USD)' });
    }
    
    if (!interval || !['1min', '5min', '15min'].includes(interval)) {
      return res.status(400).json({ success: false, error: 'Interval parameter is required and must be one of: 1min, 5min, 15min' });
    }

    const candles = await getCandles(symbol, interval, parseInt(outputsize, 10));

    res.json({ 
      success: true, 
      symbol,
      interval,
      candles 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Market data is temporarily unavailable.' });
  }
};

module.exports = {
  getMarketData
};
