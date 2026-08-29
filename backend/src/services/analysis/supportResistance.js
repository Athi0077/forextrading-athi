function calculateSupportResistance(pivots, currentPrice) {
  if (!pivots || pivots.length === 0) return { support: [], resistance: [] };

  const highs = pivots.filter(p => p.type === 'HIGH').map(p => p.price);
  const lows = pivots.filter(p => p.type === 'LOW').map(p => p.price);

  const resistanceLevels = [...new Set(highs)]
    .filter(p => p > currentPrice)
    .sort((a, b) => a - b)
    .slice(0, 3);

  const supportLevels = [...new Set(lows)]
    .filter(p => p < currentPrice)
    .sort((a, b) => b - a)
    .slice(0, 3);

  return {
    support: supportLevels,
    resistance: resistanceLevels
  };
}

module.exports = {
  calculateSupportResistance
};
