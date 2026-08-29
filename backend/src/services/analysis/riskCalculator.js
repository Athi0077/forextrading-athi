function calculateRiskReward(entry, sl, tp) {
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);
  if (risk === 0) return 0;
  return parseFloat((reward / risk).toFixed(2));
}

function calculateRisk(signal, tf15, tf5, tf1) {
  if (signal === 'WAIT') {
    return { entry: null, entryZone: null, stopLoss: null, takeProfit1: null, takeProfit2: null, riskRewardRatio: null };
  }

  const currentPrice = tf1.currentPrice;
  const atr = tf15.atr || tf5.atr || 2;

  let entry = currentPrice;
  let sl, tp1, tp2;

  if (signal === 'BUY') {
    const support = tf15.support[0] || (currentPrice - atr * 2);
    sl = Math.min(currentPrice - atr * 1.5, support);
    
    const resistance1 = tf15.resistance[0] || (currentPrice + (currentPrice - sl) * 1.5);
    const resistance2 = tf15.resistance[1] || (currentPrice + (currentPrice - sl) * 2.5);
    
    tp1 = Math.max(currentPrice + (currentPrice - sl) * 1.5, resistance1);
    tp2 = Math.max(currentPrice + (currentPrice - sl) * 2.5, resistance2);

  } else { 
    const resistance = tf15.resistance[0] || (currentPrice + atr * 2);
    sl = Math.max(currentPrice + atr * 1.5, resistance);
    
    const support1 = tf15.support[0] || (currentPrice - (sl - currentPrice) * 1.5);
    const support2 = tf15.support[1] || (currentPrice - (sl - currentPrice) * 2.5);

    tp1 = Math.min(currentPrice - (sl - currentPrice) * 1.5, support1);
    tp2 = Math.min(currentPrice - (sl - currentPrice) * 2.5, support2);
  }

  const riskRewardRatio = calculateRiskReward(entry, sl, tp2);

  return {
    entry: parseFloat(entry.toFixed(2)),
    entryZone: {
      min: parseFloat((entry - atr * 0.2).toFixed(2)),
      max: parseFloat((entry + atr * 0.2).toFixed(2))
    },
    stopLoss: parseFloat(sl.toFixed(2)),
    takeProfit1: parseFloat(tp1.toFixed(2)),
    takeProfit2: parseFloat(tp2.toFixed(2)),
    riskRewardRatio
  };
}

module.exports = {
  calculateRisk
};
