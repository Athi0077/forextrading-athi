const { calculateIndicators } = require('./indicators');
const { determineMarketStructure } = require('./marketStructure');
const { calculateSupportResistance } = require('./supportResistance');

function analyzeTimeframe(candles) {
  if (!candles || candles.length === 0) return null;

  const currentPrice = candles[candles.length - 1].close;

  const indicators = calculateIndicators(candles);
  const { trend, structure, pivots } = determineMarketStructure(candles);
  const { support, resistance } = calculateSupportResistance(pivots, currentPrice);

  let signal = 'WAIT';
  
  if (indicators) {
    if (trend === 'BULLISH' && indicators.emaTrend === 'BULLISH' && indicators.macdTrend === 'BULLISH') {
      signal = 'BULLISH';
    } else if (trend === 'BEARISH' && indicators.emaTrend === 'BEARISH' && indicators.macdTrend === 'BEARISH') {
      signal = 'BEARISH';
    } else if (trend === 'RANGE') {
      signal = 'NEUTRAL';
    }
  }

  return {
    trend,
    marketStructure: structure,
    emaTrend: indicators ? indicators.emaTrend : 'UNKNOWN',
    rsi: indicators ? parseFloat(indicators.rsi.toFixed(2)) : null,
    macd: indicators ? indicators.macdTrend : 'UNKNOWN',
    support,
    resistance,
    signal,
    currentPrice,
    atr: indicators ? parseFloat(indicators.atr.toFixed(2)) : null,
    candles: candles // Passing all requested candles back for the chart
  };
}

module.exports = {
  analyzeTimeframe
};
