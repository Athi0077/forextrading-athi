const { getCandles } = require('../services/twelveDataService');
const { analyzeTimeframe } = require('../services/analysis/timeframeAnalysis');
const { generateMultiTimeframeSignal } = require('../services/analysis/signalEngine');
const Analysis = require('../models/Analysis');

const getAnalysis = async (req, res, next) => {
  try {
    const symbol = req.query.symbol || 'XAU/USD';
    const SUPPORTED_SYMBOLS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'XAU/USD'];
    
    if (!SUPPORTED_SYMBOLS.includes(symbol)) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Unsupported symbol provided.' }});
    }

    const [candles1m, candles5m, candles15m] = await Promise.all([
      getCandles(symbol, '1min', 150),
      getCandles(symbol, '5min', 150),
      getCandles(symbol, '15min', 150)
    ]);

    const analysis15m = analyzeTimeframe(candles15m);
    const analysis5m = analyzeTimeframe(candles5m);
    const analysis1m = analyzeTimeframe(candles1m);

    if (!analysis15m || !analysis5m || !analysis1m) {
      return res.status(500).json({
        success: false,
        error: { code: 'DATA_UNAVAILABLE', message: 'Insufficient market data for analysis.' }
      });
    }

    const finalAnalysis = generateMultiTimeframeSignal(analysis15m, analysis5m, analysis1m);

    const resultData = {
      symbol,
      currentPrice: analysis1m.currentPrice,
      timeframes: {
        '15m': analysis15m,
        '5m': analysis5m,
        '1m': analysis1m
      },
      finalSignal: finalAnalysis.finalSignal,
      signalConfidence: finalAnalysis.signalConfidence,
      entry: finalAnalysis.entry,
      entryZone: finalAnalysis.entryZone,
      stopLoss: finalAnalysis.stopLoss,
      takeProfit1: finalAnalysis.takeProfit1,
      takeProfit2: finalAnalysis.takeProfit2,
      riskRewardRatio: finalAnalysis.riskRewardRatio,
      riskLevel: finalAnalysis.riskLevel,
      reasons: finalAnalysis.reasons,
      warnings: finalAnalysis.warnings
    };

    // Store analysis in MongoDB for historical tracking
    await Analysis.create(resultData);

    res.json({
      success: true,
      data: resultData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalysis
};
