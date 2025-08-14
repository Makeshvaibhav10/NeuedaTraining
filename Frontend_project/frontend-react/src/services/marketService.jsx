import { MARKET_API, API_BASE } from '../utils/constants';
import { apiCall } from './api';

// Fetch all market symbols from the market API
export const fetchMarketSymbols = async () => {
  try {
    const res = await fetch(`${MARKET_API}/GetSymbolList`);
    if (!res.ok) throw new Error(`Failed to fetch symbols: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch market symbols:', err);
    return [];
  }
};

// Fetch historical price data for a symbol
export const fetchSymbolHistory = async (symbol, days = 30) => {
  const res = await fetch(`${MARKET_API}/GetStockPricesForSymbol/${symbol}?HowManyValues=${days}`);
  if (!res.ok) throw new Error(`Failed to fetch history for ${symbol}: ${res.status}`);
  return res.json();
};

// Get a symbol's current price (via backend)
export const getSymbolPrice = async (symbol) => {
  try {
    const priceData = await apiCall(`${API_BASE}/market-data/price/${symbol}`);
    if (priceData && (priceData.price || priceData.Price)) {
      return {
        symbol: symbol,
        price: parseFloat(priceData.price || priceData.Price || 0),
        timeStamp: priceData.timeStamp || priceData.TimeStamp || new Date().toLocaleString(),
        ...priceData
      };
    }
    return null;
  } catch (err) {
    console.error(`❌ Failed to get price for ${symbol}:`, err);
    return null;
  }
};

// Get historical prices for a symbol (via backend)
export const getSymbolHistory = async (symbol, count = 20) => {
  try {
    const historyData = await apiCall(`${API_BASE}/market-data/history/${symbol}?count=${count}`);
    if (historyData && Array.isArray(historyData)) {
      return historyData.map((price, index) => ({
        time: index,
        price: parseFloat(price.price || price.Price || 0),
        timestamp: price.timeStamp || price.TimeStamp
      }));
    }
    return [];
  } catch (err) {
    console.error(`Failed to get history for ${symbol}:`, err);
    return [];
  }
};
