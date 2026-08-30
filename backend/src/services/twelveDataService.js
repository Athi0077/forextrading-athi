const axios = require('axios');
const dotenv = require('dotenv');
const MarketData = require('../models/MarketData');

dotenv.config();

const API_KEY = process.env.TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com/time_series';

const INTERVAL_MS = {
  '1min': 60 * 1000,
  '5min': 5 * 60 * 1000,
  '15min': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '1day': 24 * 60 * 60 * 1000
};

async function getCandles(symbol, interval, outputsize = 150) {
  if (!API_KEY) {
    throw new Error('Missing TWELVE_DATA_API_KEY');
  }

  try {
    const latestCached = await MarketData.findOne({ symbol, timeframe: interval }).sort({ timestamp: -1 });

    let needsFetch = true;
    if (latestCached) {
      const ageMs = Date.now() - latestCached.timestamp.getTime();
      const maxAgeMs = INTERVAL_MS[interval] || 60000;
      // If the data is fresher than the interval length, use cache
      if (ageMs < maxAgeMs) {
        needsFetch = false;
      }
    }

    if (!needsFetch) {
      const cachedData = await MarketData.find({ symbol, timeframe: interval })
        .sort({ timestamp: -1 })
        .limit(outputsize);
      
      const normalizedCache = cachedData.reverse().map(c => ({
        time: Math.floor(c.timestamp.getTime() / 1000),
        timestamp: Math.floor(c.timestamp.getTime() / 1000),
        datetime: c.timestamp.toISOString().replace('T', ' ').substring(0, 19),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume
      }));
      
      if (normalizedCache.length > 0) {
        return normalizedCache;
      }
    }

    const response = await axios.get(BASE_URL, {
      params: {
        symbol: symbol,
        interval: interval,
        outputsize: outputsize,
        apikey: API_KEY,
        format: 'JSON'
      }
    });

    const data = response.data;

    if (data.status === 'error') {
      throw new Error(data.message || 'Twelve Data API Error');
    }

    if (!data.values || data.values.length === 0) {
      throw new Error('No candle data returned');
    }

    const normalized = data.values.reverse().map(candle => {
      const timeMs = new Date(candle.datetime).getTime();
      return {
        time: Math.floor(timeMs / 1000),
        timestamp: Math.floor(timeMs / 1000),
        datetime: candle.datetime,
        open: parseFloat(candle.open),
        high: parseFloat(candle.high),
        low: parseFloat(candle.low),
        close: parseFloat(candle.close),
        volume: candle.volume ? parseFloat(candle.volume) : 0
      };
    });

    // Save to MongoDB asynchronously
    const bulkOps = normalized.map(candle => ({
      updateOne: {
        filter: { symbol, timeframe: interval, timestamp: new Date(candle.time * 1000) },
        update: { 
          $set: { 
            open: candle.open, high: candle.high, low: candle.low, close: candle.close, volume: candle.volume, source: 'twelve_data' 
          } 
        },
        upsert: true
      }
    }));
    
    // Don't await bulkWrite to speed up response, just catch errors
    MarketData.bulkWrite(bulkOps, { ordered: false }).catch(err => {
      console.warn("MongoDB bulkWrite error for MarketData:", err.message);
    });

    return normalized;
  } catch (error) {
    console.error(`Error fetching data for ${symbol} at ${interval}:`, error.message);
    
    // Fallback to whatever is in the cache if the API fails entirely
    try {
      const cachedData = await MarketData.find({ symbol, timeframe: interval })
        .sort({ timestamp: -1 })
        .limit(outputsize);
        
      if (cachedData && cachedData.length > 0) {
        return cachedData.reverse().map(c => ({
          time: Math.floor(c.timestamp.getTime() / 1000),
          timestamp: Math.floor(c.timestamp.getTime() / 1000),
          datetime: c.timestamp.toISOString().replace('T', ' ').substring(0, 19),
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume
        }));
      }
    } catch (dbError) {
      // Ignore DB fallback error and throw original error
    }
    
    throw new Error('Market data is temporarily unavailable. Please try again.');
  }
}

async function getQuotes(symbols) {
  if (!API_KEY) {
    throw new Error('Missing TWELVE_DATA_API_KEY');
  }

  try {
    const response = await axios.get('https://api.twelvedata.com/quote', {
      params: {
        symbol: symbols,
        apikey: API_KEY,
        format: 'JSON'
      }
    });

    const data = response.data;
    if (data.status === 'error') {
      throw new Error(data.message || 'Twelve Data API Error');
    }

    return data;
  } catch (error) {
    console.error(`Error fetching quotes for ${symbols}:`, error.message);
    throw new Error('Market quotes are temporarily unavailable. Please try again.');
  }
}

module.exports = {
  getCandles,
  getQuotes
};
