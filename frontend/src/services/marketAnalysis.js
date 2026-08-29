import { apiCall } from './api';

export const getXauUsdAnalysis = async () => {
  try {
    const result = await apiCall('/analysis/xauusd', {
      method: 'GET'
    });
    return result.data;
  } catch (error) {
    console.error("Error fetching analysis:", error);
    throw error;
  }
};

export const getMarketCandles = async (symbol, interval, outputsize = 100) => {
  try {
    const result = await apiCall(`/market/candles?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}`, {
      method: 'GET'
    });
    return result.candles;
  } catch (error) {
    console.error(`Error fetching candles for ${symbol} at ${interval}:`, error);
    throw error;
  }
};
