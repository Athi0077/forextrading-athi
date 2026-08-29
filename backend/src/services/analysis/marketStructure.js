function determineMarketStructure(candles) {
  if (!candles || candles.length < 20) return { trend: 'NEUTRAL', structure: 'NONE', pivots: [] };

  const pivots = [];
  const lookback = 3;

  for (let i = lookback; i < candles.length - lookback; i++) {
    let isHigh = true;
    let isLow = true;

    for (let j = 1; j <= lookback; j++) {
      if (candles[i].high <= candles[i - j].high || candles[i].high <= candles[i + j].high) isHigh = false;
      if (candles[i].low >= candles[i - j].low || candles[i].low >= candles[i + j].low) isLow = false;
    }

    if (isHigh) pivots.push({ type: 'HIGH', price: candles[i].high, index: i, timestamp: candles[i].timestamp });
    if (isLow) pivots.push({ type: 'LOW', price: candles[i].low, index: i, timestamp: candles[i].timestamp });
  }

  if (pivots.length < 4) return { trend: 'NEUTRAL', structure: 'INSUFFICIENT_DATA', pivots };

  const recentPivots = pivots.slice(-6);
  
  let highs = recentPivots.filter(p => p.type === 'HIGH');
  let lows = recentPivots.filter(p => p.type === 'LOW');

  let structure = 'RANGE';
  let trend = 'NEUTRAL';

  if (highs.length >= 2 && lows.length >= 2) {
    const lastHigh = highs[highs.length - 1].price;
    const prevHigh = highs[highs.length - 2].price;
    const lastLow = lows[lows.length - 1].price;
    const prevLow = lows[lows.length - 2].price;

    if (lastHigh > prevHigh && lastLow > prevLow) {
      structure = 'HH_HL';
      trend = 'BULLISH';
    } else if (lastHigh < prevHigh && lastLow < prevLow) {
      structure = 'LH_LL';
      trend = 'BEARISH';
    } else if (lastHigh < prevHigh && lastLow > prevLow) {
      structure = 'INSIDE';
      trend = 'NEUTRAL';
    } else if (lastHigh > prevHigh && lastLow < prevLow) {
      structure = 'EXPANDING';
      trend = 'NEUTRAL';
    }
  }

  return { trend, structure, pivots };
}

module.exports = {
  determineMarketStructure
};
