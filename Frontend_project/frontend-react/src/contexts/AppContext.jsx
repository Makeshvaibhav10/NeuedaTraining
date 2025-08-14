import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { portfolioService, marketService } from '../services';
import { USER_ID } from '../utils/constants';

const AppContext = createContext();

const initialState = {
  portfolios: [],
  selectedPortfolio: null,
  marketData: {},
  availableSymbols: [],
  watchlist: [],
  orders: [],
  stocks: [],
  transactions: [],
  priceHistory: {},
  loading: false,
  error: '',
  success: '',
  tradeForm: {
    symbol: '',
    orderType: 'BUY',
    quantity: '',
    price: ''
  },
  portfolioForm: {
    name: '',
    initialCash: 10000
  },
  searchTerm: ''
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, success: '' };
    case 'SET_SUCCESS':
      return { ...state, success: action.payload, error: '' };
    case 'CLEAR_MESSAGES':
      return { ...state, error: '', success: '' };
    case 'SET_PORTFOLIOS':
      return { ...state, portfolios: action.payload };
    case 'SET_SELECTED_PORTFOLIO':
      return { ...state, selectedPortfolio: action.payload };
    case 'SET_MARKET_DATA':
      return { ...state, marketData: { ...state.marketData, ...action.payload } };
    case 'SET_AVAILABLE_SYMBOLS':
      return { ...state, availableSymbols: action.payload };
    case 'SET_WATCHLIST':
      return { ...state, watchlist: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'SET_STOCKS':
      return { ...state, stocks: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'SET_PRICE_HISTORY':
      return { ...state, priceHistory: { ...state.priceHistory, ...action.payload } };
    case 'UPDATE_TRADE_FORM':
      return { ...state, tradeForm: { ...state.tradeForm, ...action.payload } };
    case 'RESET_TRADE_FORM':
      return { ...state, tradeForm: initialState.tradeForm };
    case 'UPDATE_PORTFOLIO_FORM':
      return { ...state, portfolioForm: { ...state.portfolioForm, ...action.payload } };
    case 'RESET_PORTFOLIO_FORM':
      return { ...state, portfolioForm: initialState.portfolioForm };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Auto-clear messages
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => dispatch({ type: 'CLEAR_MESSAGES' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [state.success]);

  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => dispatch({ type: 'CLEAR_MESSAGES' }), 6000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load portfolio data when selected portfolio changes
  useEffect(() => {
    if (state.selectedPortfolio) {
      loadPortfolioData(state.selectedPortfolio.id);
    }
  }, [state.selectedPortfolio]);

  const showSuccess = (message) => {
    dispatch({ type: 'SET_SUCCESS', payload: message });
  };

  const showError = (message) => {
    dispatch({ type: 'SET_ERROR', payload: message });
  };

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPortfolios(),
        loadAvailableSymbols()
      ]);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      showError('Failed to load some initial data');
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolios = async () => {
    try {
      const data = await portfolioService.getPortfolios(USER_ID);
      dispatch({ type: 'SET_PORTFOLIOS', payload: data });
      
      if (state.selectedPortfolio) {
        const updatedPortfolio = data.find(p => p.id === state.selectedPortfolio.id);
        if (updatedPortfolio) {
          dispatch({ type: 'SET_SELECTED_PORTFOLIO', payload: updatedPortfolio });
        }
      } else if (data.length > 0) {
        dispatch({ type: 'SET_SELECTED_PORTFOLIO', payload: data[0] });
      }
    } catch (err) {
      console.error('Failed to load portfolios:', err);
      dispatch({ type: 'SET_PORTFOLIOS', payload: [] });
    }
  };

  const loadAvailableSymbols = async () => {
    try {
      setLoading(true);
      const symbols = await marketService.getSymbols();
      dispatch({ type: 'SET_AVAILABLE_SYMBOLS', payload: symbols });
      showSuccess(`Loaded ${symbols.length} symbols from backend`);
    } catch (err) {
      console.error('Failed to load symbols:', err);
      dispatch({ type: 'SET_AVAILABLE_SYMBOLS', payload: [] });
      showError('Failed to load symbols from backend');
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolioData = async (portfolioId) => {
    if (!portfolioId) return;
    
    try {
      await Promise.all([
        loadWatchlist(portfolioId),
        loadOrders(portfolioId),
        loadStocks(portfolioId),
        loadTransactions(portfolioId)
      ]);
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
    }
  };

  const loadWatchlist = async (portfolioId) => {
    try {
      const data = await portfolioService.getWatchlist(portfolioId);
      dispatch({ type: 'SET_WATCHLIST', payload: data });
    } catch (err) {
      console.error('Failed to load watchlist:', err);
      dispatch({ type: 'SET_WATCHLIST', payload: [] });
    }
  };

  const loadOrders = async (portfolioId) => {
    try {
      const data = await portfolioService.getOrders(portfolioId);
      dispatch({ type: 'SET_ORDERS', payload: data });
    } catch (err) {
      console.error('Failed to load orders:', err);
      dispatch({ type: 'SET_ORDERS', payload: [] });
    }
  };

  const loadStocks = async (portfolioId) => {
    try {
      const data = await portfolioService.getStocks(portfolioId);
      dispatch({ type: 'SET_STOCKS', payload: data });
      
      // Update market data for held stocks
      if (data.length > 0) {
        for (const stock of data) {
          if (!state.marketData[stock.symbol]) {
            try {
              const priceData = await marketService.getPrice(stock.symbol);
              if (priceData) {
                dispatch({ type: 'SET_MARKET_DATA', payload: { [stock.symbol]: priceData } });
              }
            } catch (err) {
              console.warn(`Failed to get price for ${stock.symbol}:`, err);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load stocks:', err);
      dispatch({ type: 'SET_STOCKS', payload: [] });
    }
  };

  const loadTransactions = async (portfolioId) => {
    try {
      const data = await portfolioService.getTransactions(portfolioId);
      dispatch({ type: 'SET_TRANSACTIONS', payload: data });
    } catch (err) {
      console.error('Failed to load transactions:', err);
      dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
    }
  };

  const createPortfolio = async () => {
    if (!state.portfolioForm.name.trim()) {
      showError('Please enter a portfolio name');
      return;
    }
    
    try {
      setLoading(true);
      await portfolioService.createPortfolio(
        USER_ID, 
        state.portfolioForm.name, 
        state.portfolioForm.initialCash
      );
      dispatch({ type: 'RESET_PORTFOLIO_FORM' });
      await loadPortfolios();
      showSuccess('Portfolio created successfully!');
    } catch (err) {
      console.error('Failed to create portfolio:', err);
      showError('Failed to create portfolio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (symbol, companyName) => {
    if (!state.selectedPortfolio) {
      showError('Please select a portfolio first');
      return;
    }
    
    if (state.watchlist.some(item => item.symbol === symbol)) {
      showError(`${symbol} is already in your watchlist`);
      return;
    }
    
    try {
      await portfolioService.addToWatchlist(state.selectedPortfolio.id, symbol, companyName);
      await loadWatchlist(state.selectedPortfolio.id);
      showSuccess(`Added ${symbol} to watchlist!`);
      
      // Get initial price for the new symbol
      setTimeout(async () => {
        try {
          const priceData = await marketService.getPrice(symbol);
          if (priceData) {
            dispatch({ type: 'SET_MARKET_DATA', payload: { [symbol]: priceData } });
          }
        } catch (err) {
          console.warn(`Failed to get price for ${symbol}:`, err);
        }
      }, 500);
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
      showError('Failed to add to watchlist. Please try again.');
    }
  };

  const removeFromWatchlist = async (symbol) => {
    if (!state.selectedPortfolio) return;
    
    try {
      await portfolioService.removeFromWatchlist(state.selectedPortfolio.id, symbol);
      await loadWatchlist(state.selectedPortfolio.id);
      showSuccess(`Removed ${symbol} from watchlist!`);
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
      showError('Failed to remove from watchlist. Please try again.');
    }
  };

  const submitOrder = async () => {
    if (!state.selectedPortfolio) {
      showError('❌ Please select a portfolio first');
      return;
    }

    setLoading(true);
    try {
      if (state.tradeForm.symbol && state.tradeForm.quantity && state.tradeForm.price) {
        const quantity = parseInt(state.tradeForm.quantity, 10);
        const price = parseFloat(state.tradeForm.price);
        const symbol = state.tradeForm.symbol.toUpperCase();

        if (quantity <= 0 || isNaN(quantity)) {
          showError('❌ Quantity must be a positive number');
          return;
        }
        if (price <= 0 || isNaN(price)) {
          showError('❌ Price must be a positive number');
          return;
        }

        // Validation for different order types
        if (state.tradeForm.orderType === 'BUY') {
          const totalCost = quantity * price;
          const availableCash = state.selectedPortfolio.cashBalance || state.selectedPortfolio.initialCash || 0;
          
          if (totalCost > availableCash) {
            showError(`❌ Insufficient funds! Required: $${totalCost.toFixed(2)}, Available: $${availableCash.toFixed(2)}`);
            return;
          }
        } else if (state.tradeForm.orderType === 'SELL') {
          const holding = state.stocks.find(stock => 
            stock.symbol?.toUpperCase() === symbol && stock.quantity > 0
          );
          
          if (!holding) {
            showError(`❌ No holdings found for ${symbol}. You don't own any shares of this stock.`);
            return;
          }
          
          const availableShares = parseInt(holding.quantity) || 0;
          if (quantity > availableShares) {
            showError(`❌ Insufficient shares! You own ${availableShares} shares but trying to sell ${quantity} shares of ${symbol}`);
            return;
          }
        }

        await portfolioService.submitOrder({
          portfolioId: state.selectedPortfolio.id,
          symbol: symbol,
          orderType: state.tradeForm.orderType,
          quantity,
          price
        });

        dispatch({ type: 'RESET_TRADE_FORM' });
        showSuccess(`🎉 ${state.tradeForm.orderType} Order Executed Successfully!`);
        
        // Refresh data
        await new Promise(resolve => setTimeout(resolve, 2000));
        await loadPortfolios();
        if (state.selectedPortfolio) {
          await loadPortfolioData(state.selectedPortfolio.id);
        }
      }
    } catch (err) {
      console.error('❌ Order process failed:', err);
      showError(`❌ Order failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateMarketData = async () => {
    if (state.watchlist.length === 0) {
      showError('No symbols in watchlist to update');
      return;
    }
    
    let successCount = 0;
    const newMarketData = {};
    const newPriceHistory = {};
    
    for (const item of state.watchlist) {
      try {
        const [currentPrice, historicalPrices] = await Promise.all([
          marketService.getPrice(item.symbol),
          marketService.getHistory(item.symbol, 20)
        ]);
        
        if (currentPrice) {
          newMarketData[item.symbol] = currentPrice;
          successCount++;
        }
        
        if (historicalPrices.length > 0) {
          newPriceHistory[item.symbol] = historicalPrices;
        }
      } catch (err) {
        console.error(`Failed to update market data for ${item.symbol}:`, err);
      }
    }
    
    dispatch({ type: 'SET_MARKET_DATA', payload: newMarketData });
    dispatch({ type: 'SET_PRICE_HISTORY', payload: newPriceHistory });
    
    if (successCount > 0) {
      showSuccess(`Updated prices for ${successCount} symbols`);
    } else {
      showError('Failed to update any symbol prices');
    }
  };

  const fillCurrentPrice = async (symbol) => {
    if (!symbol) return;
    
    try {
      setLoading(true);
      const priceData = await marketService.getPrice(symbol);
      if (priceData && priceData.price) {
        dispatch({ 
          type: 'UPDATE_TRADE_FORM', 
          payload: { symbol, price: priceData.price.toString() } 
        });
        dispatch({ type: 'SET_MARKET_DATA', payload: { [symbol]: priceData } });
        showSuccess(`✅ Loaded current price for ${symbol}: $${priceData.price.toFixed(2)}`);
      } else {
        showError(`❌ Could not fetch price for ${symbol} from backend`);
      }
    } catch (err) {
      console.error('❌ Failed to get price:', err);
      showError(`❌ Could not fetch price for ${symbol}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await loadInitialData();
      if (state.selectedPortfolio) {
        await loadPortfolioData(state.selectedPortfolio.id);
      }
      await updateMarketData();
    } catch (err) {
      console.error('Failed to refresh data:', err);
      showError('Failed to refresh some data. Please check connections.');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    state,
    dispatch,
    // Actions
    showSuccess,
    showError,
    setLoading,
    loadPortfolios,
    loadAvailableSymbols,
    createPortfolio,
    addToWatchlist,
    removeFromWatchlist,
    submitOrder,
    updateMarketData,
    fillCurrentPrice,
    refreshData,
    loadPortfolioData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};