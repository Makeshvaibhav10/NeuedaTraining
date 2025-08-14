import { useState } from 'react';
import {
  loadPortfolios,
  loadPortfolioData,
  createPortfolio,
  addToWatchlist,
  removeFromWatchlist,
  loadWatchlist,
  loadOrders,
  loadStocks,
  loadTransactions
} from '../services/portfolioService';

export const usePortfolio = (showSuccess, showError) => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const data = await loadPortfolios();
      setPortfolios(data);
      if (!selectedPortfolio && data.length > 0) {
        setSelectedPortfolio(data[0]);
      }
    } catch (err) {
      console.error('❌ Failed to load portfolios:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioData = async (portfolioId) => {
    try {
      const { watchlist, orders, stocks, transactions } = await loadPortfolioData(portfolioId);
      setWatchlist(watchlist);
      setOrders(orders);
      setStocks(stocks);
      setTransactions(transactions);
    } catch (err) {
      console.error('❌ Failed to load portfolio data:', err);
    }
  };

  const createNewPortfolio = async (name, initialCash) => {
    if (!name.trim()) {
      showError('Please enter a portfolio name');
      return;
    }
    try {
      setLoading(true);
      await createPortfolio(name, initialCash);
      await fetchPortfolios();
      showSuccess('Portfolio created successfully!');
    } catch (err) {
      console.error('❌ Failed to create portfolio:', err);
      showError('Failed to create portfolio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSymbolToWatchlist = async (symbol, companyName) => {
    if (!selectedPortfolio) {
      showError('Please select a portfolio first');
      return;
    }
    if (watchlist.some(item => item.symbol === symbol)) {
      showError(`${symbol} is already in your watchlist`);
      return;
    }
    try {
      await addToWatchlist(selectedPortfolio.id, symbol, companyName);
      await fetchPortfolioData(selectedPortfolio.id);
      showSuccess(`Added ${symbol} to watchlist!`);
    } catch (err) {
      console.error('❌ Failed to add to watchlist:', err);
      showError('Failed to add to watchlist.');
    }
  };

  const removeSymbolFromWatchlist = async (symbol) => {
    if (!selectedPortfolio) return;
    try {
      await removeFromWatchlist(selectedPortfolio.id, symbol);
      await fetchPortfolioData(selectedPortfolio.id);
      showSuccess(`Removed ${symbol} from watchlist!`);
    } catch (err) {
      console.error('❌ Failed to remove from watchlist:', err);
      showError('Failed to remove from watchlist.');
    }
  };

  return {
    portfolios,
    selectedPortfolio,
    setSelectedPortfolio,
    watchlist,
    orders,
    stocks,
    transactions,
    loading,
    fetchPortfolios,
    fetchPortfolioData,
    createNewPortfolio,
    addSymbolToWatchlist,
    removeSymbolFromWatchlist
  };
};
