const { EMA, RSI, MACD, ATR } = require('technicalindicators');

function calculateIndicators(candles) {
  if (!candles || candles.length < 60) {
    return null;
  }

  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);

  const ema20Arr = EMA.calculate({ period: 20, values: closes });
  const ema50Arr = EMA.calculate({ period: 50, values: closes });
  const rsi14Arr = RSI.calculate({ period: 14, values: closes });
  
  const macdArr = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });

  const atr14Arr = ATR.calculate({
    high: highs,
    low: lows,
    close: closes,
    period: 14
  });

  const ema20 = ema20Arr[ema20Arr.length - 1];
  const ema50 = ema50Arr[ema50Arr.length - 1];
  const rsi = rsi14Arr[rsi14Arr.length - 1];
  const macd = macdArr[macdArr.length - 1];
  const atr = atr14Arr[atr14Arr.length - 1];

  let emaTrend = 'NEUTRAL';
  if (ema20 > ema50) {
    emaTrend = 'BULLISH';
  } else if (ema20 < ema50) {
    emaTrend = 'BEARISH';
  }

  let macdTrend = 'NEUTRAL';
  if (macd && macd.MACD > macd.signal) {
    macdTrend = 'BULLISH';
  } else if (macd && macd.MACD < macd.signal) {
    macdTrend = 'BEARISH';
  }

  return {
    ema20,
    ema50,
    emaTrend,
    rsi,
    macd,
    macdTrend,
    atr
  };
}

module.exports = {
  calculateIndicators
};
