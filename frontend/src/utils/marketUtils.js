export const MARKET_CONFIG = {
  'EUR/USD': {
    displaySymbol: 'EUR/USD',
    apiSymbol: 'EURUSD',
    type: 'forex'
  },
  'GBP/USD': {
    displaySymbol: 'GBP/USD',
    apiSymbol: 'GBPUSD',
    type: 'forex'
  },
  'USD/JPY': {
    displaySymbol: 'USD/JPY',
    apiSymbol: 'USDJPY',
    type: 'forex'
  },
  'USD/CHF': {
    displaySymbol: 'USD/CHF',
    apiSymbol: 'USDCHF',
    type: 'forex'
  },
  'AUD/USD': {
    displaySymbol: 'AUD/USD',
    apiSymbol: 'AUDUSD',
    type: 'forex'
  },
  'USD/CAD': {
    displaySymbol: 'USD/CAD',
    apiSymbol: 'USDCAD',
    type: 'forex'
  },
  'NZD/USD': {
    displaySymbol: 'NZD/USD',
    apiSymbol: 'NZDUSD',
    type: 'forex'
  },
  'XAU/USD': {
    displaySymbol: 'XAU/USD',
    apiSymbol: 'XAUUSD',
    type: 'commodity'
  }
};

export const normalizeSymbol = (symbol) => 
  String(symbol || '')
    .replace('/', '')
    .toUpperCase();

export const formatMarketPrice = (symbol, price) => {
  if (price === null || price === undefined || isNaN(price)) return '0.00';
  
  const numPrice = Number(price);
  
  if (symbol === 'XAU/USD') {
    return numPrice.toFixed(2);
  }
  
  if (symbol === 'USD/JPY' || symbol?.includes('JPY')) {
    return numPrice.toFixed(3);
  }
  
  // Default Forex
  return numPrice.toFixed(5);
};

export const calculatePipValue = (symbol) => {
  if (symbol === 'XAU/USD') return 10;
  if (symbol === 'USD/JPY' || symbol?.includes('JPY')) return 1000;
  
  // Default Forex (assuming USD quote)
  return 100000;
};
