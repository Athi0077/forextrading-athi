const { calculateRisk } = require('./riskCalculator');

function generateMultiTimeframeSignal(tf15, tf5, tf1) {
  let finalSignal = 'WAIT';
  let confidence = 0;
  const reasons = [];
  const warnings = [];

  const isBullishConfluence = tf15.signal === 'BULLISH' && tf5.signal === 'BULLISH' && (tf1.signal === 'BULLISH' || tf1.rsi < 40);
  const isBearishConfluence = tf15.signal === 'BEARISH' && tf5.signal === 'BEARISH' && (tf1.signal === 'BEARISH' || tf1.rsi > 60);

  if (isBullishConfluence) {
    finalSignal = 'BUY';
    confidence = 80;
    reasons.push('15M trend is bullish.');
    reasons.push('5M confirms bullish setup.');
    reasons.push('1M indicates favorable entry timing.');
    if (tf15.marketStructure === 'HH_HL') confidence += 10;
  } else if (isBearishConfluence) {
    finalSignal = 'SELL';
    confidence = 80;
    reasons.push('15M trend is bearish.');
    reasons.push('5M confirms bearish setup.');
    reasons.push('1M indicates favorable entry timing.');
    if (tf15.marketStructure === 'LH_LL') confidence += 10;
  } else {
    finalSignal = 'WAIT';
    confidence = 50;
    reasons.push('Timeframes are not fully aligned.');
    if (tf15.signal !== tf5.signal) {
      warnings.push(`15M trend (${tf15.signal}) conflicts with 5M trend (${tf5.signal}).`);
    }
  }

  if (tf15.rsi > 70 && finalSignal === 'BUY') {
    warnings.push('15M RSI is overbought, risk of pullback.');
    confidence -= 15;
  }
  if (tf15.rsi < 30 && finalSignal === 'SELL') {
    warnings.push('15M RSI is oversold, risk of bounce.');
    confidence -= 15;
  }

  if (confidence < 60 && finalSignal !== 'WAIT') {
    finalSignal = 'WAIT';
    warnings.push('Signal confidence too low, switching to WAIT.');
  }

  const risk = calculateRisk(finalSignal, tf15, tf5, tf1);

  return {
    finalSignal,
    signalConfidence: Math.max(0, Math.min(100, confidence)),
    reasons,
    warnings,
    ...risk,
    riskLevel: risk.riskRewardRatio && risk.riskRewardRatio >= 2 ? 'LOW' : 'MEDIUM'
  };
}

module.exports = {
  generateMultiTimeframeSignal
};
