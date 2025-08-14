import { API_BASE, USER_ID } from '../utils/constants';
import { apiCall } from './api';

// Load all user portfolios
export const loadPortfolios = async () => {
  const data = await apiCall(`${API_BASE}/portfolios/user/${USER_ID}`);
  return Array.isArray(data) ? data : [];
};

// Load data for a specific portfolio
export const loadPortfolioData = async (portfolioId) => {
  if (!portfolioId) return {};
  const [watchlist, orders, stocks, transactions] = await Promise.all([
    loadWatchlist(portfolioId),
    loadOrders(portfolioId),
    loadStocks(portfolioId),
    loadTransactions(portfolioId)
  ]);
  return { watchlist, orders, stocks, transactions };
};

// Create a new portfolio
export const createPortfolio = async (name, initialCash) => {
  const url = `${API_BASE}/portfolios?userId=${USER_ID}&portfolioName=${encodeURIComponent(name)}&initialCash=${initialCash}`;
  return await apiCall(url, { method: 'POST' });
};

// Watchlist operations
export const loadWatchlist = async (portfolioId) => {
  const data = await apiCall(`${API_BASE}/watchlist/portfolio/${portfolioId}`);
  return Array.isArray(data) ? data : [];
};

export const addToWatchlist = async (portfolioId, symbol, companyName) => {
  const url = `${API_BASE}/watchlist?portfolioId=${portfolioId}&symbol=${symbol}&companyName=${encodeURIComponent(companyName)}`;
  return await apiCall(url, { method: 'POST' });
};

export const removeFromWatchlist = async (portfolioId, symbol) => {
  return await apiCall(`${API_BASE}/watchlist/portfolio/${portfolioId}/symbol/${symbol}`, { method: 'DELETE' });
};

// Orders
export const loadOrders = async (portfolioId) => {
  const data = await apiCall(`${API_BASE}/orders/portfolio/${portfolioId}`);
  return Array.isArray(data) ? data : [];
};

// Stocks
export const loadStocks = async (portfolioId) => {
  const data = await apiCall(`${API_BASE}/stocks/portfolio/${portfolioId}`);
  return Array.isArray(data) ? data : (data.stocks || data.holdings || []);
};

// Transactions
export const loadTransactions = async (portfolioId) => {
  const data = await apiCall(`${API_BASE}/transactions/portfolio/${portfolioId}`);
  return Array.isArray(data) ? data : [];
};
