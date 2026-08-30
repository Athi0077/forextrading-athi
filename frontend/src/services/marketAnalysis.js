import { apiCall } from './api';

export const getMarketAnalysis = async (symbol = 'XAU/USD') => {
  try {
    const result = await apiCall(`/analysis?symbol=${encodeURIComponent(symbol)}`, {
      method: 'GET'
    });
    return result.data;
  } catch (error) {
    console.error(`Error fetching analysis for ${symbol}:`, error);
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

export const getMarketQuotes = async (symbols) => {
  try {
    // symbols is a comma separated string, e.g. 'EUR/USD,GBP/USD'
    const result = await apiCall(`/market/quotes?symbols=${encodeURIComponent(symbols)}`, {
      method: 'GET'
    });
    return result.quotes;
  } catch (error) {
    console.error(`Error fetching quotes for ${symbols}:`, error);
    throw error;
  }
};
