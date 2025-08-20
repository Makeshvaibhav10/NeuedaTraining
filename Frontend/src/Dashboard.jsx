import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Eye, ShoppingCart, BarChart3, Wallet, RefreshCw, Plus, Minus, AlertCircle, Activity, Users, Calendar, Target, Search } from 'lucide-react';
import StockDashboard from './StockDashboard';
import HoldingsChart from './HoldingsChart';
import StockAnalysisPanel from './StockAnalysisPanel';

import { CheckCircle, X } from 'lucide-react';

const API_BASE = 'http://localhost:8082/api';
const MARKET_API = 'https://marketdata.neueda.com/API/StockFeed';
const USER_ID = 'user123';

const Dashboard = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [marketData, setMarketData] = useState({});
  const [availableSymbols, setAvailableSymbols] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState(null);
  const [liveStockPrice, setLiveStockPrice] = useState(null);

  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [priceHistory, setPriceHistory] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [marketSymbols, setMarketSymbols] = useState([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState('');
  const [marketSearch, setMarketSearch] = useState('');
  const [marketCurrentPage, setMarketCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSymbol, setModalSymbol] = useState(null);
  const [modalChartData, setModalChartData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedSymbolDetails, setSelectedSymbolDetails] = useState(null);


  const showOrderFeedback = (orderType, symbol, quantity, price, totalAmount) => {
    setOrderSummary({
      type: orderType,
      symbol: symbol,
      quantity: quantity,
      price: price,
      totalAmount: totalAmount,
      timestamp: new Date().toLocaleTimeString()
    });
    
    setShowOrderPopup(true);
    
    // Auto-hide popup after 3 seconds
    setTimeout(() => {
      setShowOrderPopup(false);
      setOrderSummary(null);
    }, 3000);
  };
  
  // Success Popup Component (add this inside your component, before renderDashboard)
  const OrderSuccessPopup = () => {
    if (!showOrderPopup || !orderSummary) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl p-6 max-w-sm mx-4 border border-slate-600 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                orderSummary.type === 'BUY' ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'
              }`}>
                ✓
              </div>
              <h3 className="text-xl font-bold text-white">
                {orderSummary.type} Order Complete
              </h3>
            </div>
            <button 
              onClick={() => setShowOrderPopup(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span>Symbol:</span>
              <span className="font-semibold text-white">{orderSummary.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span>Order Type:</span>
              <span className={`font-semibold ${orderSummary.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                {orderSummary.type}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Quantity:</span>
              <span className="font-semibold text-white">{orderSummary.quantity} shares</span>
            </div>
            <div className="flex justify-between">
              <span>Price:</span>
              <span className="font-semibold text-white">
                {formatCurrency(orderSummary.price)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-semibold text-white">
                {formatCurrency(orderSummary.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span className="font-semibold text-white">{orderSummary.timestamp}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-600">
            <p className="text-center text-green-400 font-semibold">
              Summary Done ✓
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  const holdingsForChart = useMemo(() => {
    return (stocks || []).map((s) => ({
      symbol: s.symbol,
      quantity: Number(s.quantity ?? 0),
      // Use currentPrice, or averagePrice if currentPrice is null or 0, or 0 as ultimate fallback
      currentPrice:
        typeof s.currentPrice === "number" && s.currentPrice
          ? s.currentPrice
          : typeof s.averagePrice === "number"
          ? s.averagePrice
          : 0,
    }));
  }, [stocks]);


  useEffect(() => {
    if (!selectedStockSymbol) return;



    const fetchLivePrice = async () => {
      setLiveStockPrice(null); // indicates loading
      try {
        const response = await fetch(
          `https://marketdata.neueda.com/API/StockFeed/GetStockPricesForSymbol/${selectedStockSymbol.toLowerCase()}`
        );
        if (!response.ok) throw new Error("Network error");
        const data = await response.json();

        console.log("LIVE PRICE API RESPONSE:", data);

        const lastPrice =
          Array.isArray(data) && data.length > 0 ? data[0].price : null;

        setLiveStockPrice(
          typeof lastPrice === "number" && !isNaN(lastPrice) ? lastPrice : null
        );
      } catch (err) {
        setLiveStockPrice(null);
        console.error("Failed to fetch live price:", err);
      }
    };

    fetchLivePrice();
  }, [selectedStockSymbol]);



  
  const fetchMarketSymbols = async () => {
    try {
      setMarketLoading(true);
      setMarketError('');
      const res = await fetch(`${MARKET_API}/GetSymbolList`);
      if (!res.ok) throw new Error(`Failed to fetch symbols: ${res.status}`);
      const data = await res.json();
      setMarketSymbols(Array.isArray(data) ? data : []);
      showSuccess(`Loaded ${data.length} market symbols`);
    } catch (err) {
      console.error('Failed to fetch market symbols:', err);
      setMarketError(err.message);
      showError(`Failed to load market symbols: ${err.message}`);
      setMarketSymbols([]);
    } finally {
      setMarketLoading(false);
    }
  };
  
  const fetchSymbolHistory = async (symbol, days = 30) => {
    const res = await fetch(`${MARKET_API}/GetStockPricesForSymbol/${symbol}?HowManyValues=${days}`);
    if (!res.ok) throw new Error(`Failed to fetch history for ${symbol}: ${res.status}`);
    return res.json();
  };
  
  const formatChartData = (data) => {
    return data.map((point, idx) => ({
      name: point.dateTime || `Day ${idx + 1}`,
      price: point.price || point.close || 0,
    }));
  };
  
  const openModal = async (symObj) => {
    setModalOpen(true);
    setModalSymbol(symObj);
    setModalLoading(true);
    try {
      const history = await fetchSymbolHistory(symObj.symbol, 30);
      setModalChartData(formatChartData(history));
    } catch (err) {
      showError(`Error loading chart for ${symObj.symbol}: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };
  
  const closeModal = () => {
    setModalOpen(false);
    setModalSymbol(null);
    setModalChartData([]);
  };
  
  const handleAddToMarketWatchlist = async (symObj) => {
    if (!selectedPortfolio) {
      showError('Please select a portfolio first');
      return;
    }
    
    try {
      await addToWatchlist(symObj.symbol, symObj.companyName);
      showSuccess(`⭐ ${symObj.symbol} added to watchlist`);
    } catch (err) {
      showError(`Error adding to watchlist: ${err.message}`);
    }
  };

  // Trade Form State
  const [tradeForm, setTradeForm] = useState({
    symbol: '',
    orderType: 'BUY',
    quantity: '',
    price: ''
  });

  // Portfolio Form State
  const [portfolioForm, setPortfolioForm] = useState({
    name: '',
    initialCash: 10000
  });

  // Enhanced API call with better error handling and timeout
  const apiCall = async (url, options = {}) => {
    try {
      console.log(`Making API call to: ${url}`, options);
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000)
      );
      
      // Enhanced headers for market API
      const isMarketAPI = url.includes('https://marketdata.neueda.com/');
      const defaultHeaders = {
        'Accept': 'application/json',
        ...(isMarketAPI ? {} : { 'Content-Type': 'application/json' })
      };
      
      const fetchPromise = fetch(url, {
        method: 'GET',
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log(`Response status: ${response.status} for ${url}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        // Try to parse as JSON if it looks like JSON
        if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
          try {
            data = JSON.parse(text);
          } catch (e) {
            data = text;
          }
        } else {
          data = text;
        }
      }
      
      console.log('Response data for', url, ':', data);
      return data;
    } catch (err) {
      console.error('API Call failed for', url, ':', err);
      throw err;
    }
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 4000);
  };

  const showError = (message) => {
    setError(message);
    setSuccess('');
    setTimeout(() => setError(''), 6000);
  };

  const checkOrderStatus = async (orderId) => {
    try {
      const order = await apiCall(`${API_BASE}/orders/${orderId}`);
      return order;
    } catch (err) {
      console.error(`Failed to check order ${orderId} status:`, err);
      return null;
    }
  };

  // Add this function to calculate portfolio performance metrics
const calculatePortfolioMetrics = () => {
  if (!selectedPortfolio || stocks.length === 0) return null;

  let totalInvested = 0;
  let totalCurrentValue = 0;
  let stockPerformance = [];

  const portfolioBreakdown = stocks.map(stock => {
    const currentPrice = marketData[stock.symbol]?.price || stock.currentPrice || stock.averagePrice;
    const invested = stock.averagePrice * stock.quantity;
    const currentValue = currentPrice * stock.quantity;
    const gainLoss = currentValue - invested;
    const gainLossPercent = invested ? (gainLoss / invested) * 100 : 0;

    totalInvested += invested;
    totalCurrentValue += currentValue;

    const performanceData = {
      symbol: stock.symbol,
      quantity: stock.quantity,
      averagePrice: stock.averagePrice,
      currentPrice: currentPrice,
      invested: invested,
      currentValue: currentValue,
      gainLoss: gainLoss,
      gainLossPercent: gainLossPercent,
      weight: 0 // Will be calculated below
    };

    stockPerformance.push(performanceData);
    return performanceData;
  });

  // Calculate weights
  portfolioBreakdown.forEach(stock => {
    stock.weight = totalCurrentValue > 0 ? (stock.currentValue / totalCurrentValue) * 100 : 0;
  });

  const totalGainLoss = totalCurrentValue - totalInvested;
  const totalGainLossPercent = totalInvested ? (totalGainLoss / totalInvested) * 100 : 0;

  // Sort for gainers and losers
  const gainers = portfolioBreakdown.filter(stock => stock.gainLoss > 0).sort((a, b) => b.gainLossPercent - a.gainLossPercent);
  const losers = portfolioBreakdown.filter(stock => stock.gainLoss < 0).sort((a, b) => a.gainLossPercent - b.gainLossPercent);

  return {
    totalInvested,
    totalCurrentValue,
    totalGainLoss,
    totalGainLossPercent,
    portfolioBreakdown,
    gainers: gainers.slice(0, 5),
    losers: losers.slice(0, 5),
    cashBalance: selectedPortfolio.cashBalance || selectedPortfolio.initialCash || 0
  };
};

// Enhanced Portfolio Performance Component for Dashboard
const renderPortfolioPerformance = () => {
  const metrics = calculatePortfolioMetrics();
  
  if (!selectedPortfolio) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
        <div className="text-center text-slate-400 py-8">
          <Wallet className="mx-auto mb-3 opacity-50" size={48} />
          <p className="text-lg">Select a portfolio to view performance</p>
        </div>
      </div>
    );
  }

  if (!metrics || stocks.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Activity className="mr-3" />
          Portfolio Performance
        </h2>
         {/* NEW: Holdings Distribution Chart Changes MADE HERE */}
         {selectedPortfolio && stocks.length > 0 && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                🥧 Holdings Distribution
              </h2>
              <HoldingsChart
                holdings={holdingsForChart}
                onSelectStock={setSelectedStockSymbol}
              />

              {selectedStockSymbol && (
                <StockAnalysisPanel
                  symbol={selectedStockSymbol}
                  stocks={stocks}
                  transactions={transactions}
                  priceHistory={priceHistory[selectedStockSymbol] || []}
                  livePrice={liveStockPrice}
                  onClose={() => setSelectedStockSymbol(null)}
                />
              )}
            </div>
          )}
        <div className="text-center text-slate-400 py-8">
          <BarChart3 className="mx-auto mb-3 opacity-50" size={48} />
          <p className="text-lg">No holdings to analyze</p>
          <p className="text-sm">Start trading to see your portfolio performance</p>
        </div>
      </div>
    );
  }

  // Prepare data for pie chart
  const pieData = [
    {
      name: 'Cash',
      value: metrics.cashBalance,
      color: '#3b82f6',
      percentage: ((metrics.cashBalance / (metrics.totalCurrentValue + metrics.cashBalance)) * 100).toFixed(1)
    },
    ...metrics.portfolioBreakdown.map((stock, index) => ({
      name: stock.symbol,
      value: stock.currentValue,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
      percentage: stock.weight.toFixed(1),
      gainLoss: stock.gainLoss,
      gainLossPercent: stock.gainLossPercent
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Overall Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-4 border border-blue-700">
          <div className="text-blue-200 text-sm">Total Invested</div>
          <div className="text-xl font-bold text-white">{formatCurrency(metrics.totalInvested)}</div>
        </div>
        <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-4 border border-green-700">
          <div className="text-green-200 text-sm">Current Value</div>
          <div className="text-xl font-bold text-white">{formatCurrency(metrics.totalCurrentValue)}</div>
        </div>
        <div className={`bg-gradient-to-br rounded-xl p-4 border ${
          metrics.totalGainLoss >= 0 
            ? 'from-emerald-800 to-emerald-900 border-emerald-700' 
            : 'from-red-800 to-red-900 border-red-700'
        }`}>
          <div className={`text-sm ${metrics.totalGainLoss >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
            Total P&L
          </div>
          <div className={`text-xl font-bold flex items-center ${
            metrics.totalGainLoss >= 0 ? 'text-emerald-300' : 'text-red-300'
          }`}>
            {metrics.totalGainLoss >= 0 ? <TrendingUp size={20} className="mr-1" /> : <TrendingDown size={20} className="mr-1" />}
            {formatCurrency(Math.abs(metrics.totalGainLoss))}
          </div>
        </div>
        <div className={`bg-gradient-to-br rounded-xl p-4 border ${
          metrics.totalGainLossPercent >= 0 
            ? 'from-emerald-800 to-emerald-900 border-emerald-700' 
            : 'from-red-800 to-red-900 border-red-700'
        }`}>
          <div className={`text-sm ${metrics.totalGainLossPercent >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
            Total Return %
          </div>
          <div className={`text-xl font-bold ${
            metrics.totalGainLossPercent >= 0 ? 'text-emerald-300' : 'text-red-300'
          }`}>
            {metrics.totalGainLossPercent >= 0 ? '+' : ''}{metrics.totalGainLossPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Allocation Pie Chart */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Target className="mr-2" />
            Portfolio Allocation
          </h3>
          
          {/* Pie Chart */}
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(value), name]}
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-medium">{item.percentage}%</span>
                  <span className="text-slate-400 ml-2">({formatCurrency(item.value)})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Gainers and Losers */}
        <div className="space-y-4">
          {/* Top Gainers */}
          <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-6 border border-green-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <TrendingUp className="mr-2" />
              Top Gainers ({metrics.gainers.length})
            </h3>
            
            {metrics.gainers.length > 0 ? (
              <div className="space-y-3">
                {metrics.gainers.map((stock, index) => (
                  <div key={stock.symbol} className="flex justify-between items-center bg-green-900/30 rounded-lg p-3">
                    <div>
                      <div className="font-semibold text-white">{stock.symbol}</div>
                      <div className="text-green-200 text-sm">{stock.quantity} shares</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-300 font-bold">+{formatCurrency(stock.gainLoss)}</div>
                      <div className="text-green-400 text-sm">+{stock.gainLossPercent.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-green-200 py-4">
                <div className="text-sm opacity-75">No gainers yet</div>
              </div>
            )}
          </div>

          {/* Top Losers */}
          <div className="bg-gradient-to-br from-red-800 to-red-900 rounded-xl p-6 border border-red-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <TrendingDown className="mr-2" />
              Top Losers ({metrics.losers.length})
            </h3>
            
            {metrics.losers.length > 0 ? (
              <div className="space-y-3">
                {metrics.losers.map((stock, index) => (
                  <div key={stock.symbol} className="flex justify-between items-center bg-red-900/30 rounded-lg p-3">
                    <div>
                      <div className="font-semibold text-white">{stock.symbol}</div>
                      <div className="text-red-200 text-sm">{stock.quantity} shares</div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-300 font-bold">{formatCurrency(stock.gainLoss)}</div>
                      <div className="text-red-400 text-sm">{stock.gainLossPercent.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-red-200 py-4">
                <div className="text-sm opacity-75">No losers yet</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Holdings Table */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <BarChart3 className="mr-2" />
          Holdings Performance
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left text-slate-400 pb-3">Symbol</th>
                <th className="text-right text-slate-400 pb-3">Quantity</th>
                <th className="text-right text-slate-400 pb-3">Avg Price</th>
                <th className="text-right text-slate-400 pb-3">Current Price</th>
                <th className="text-right text-slate-400 pb-3">Market Value</th>
                <th className="text-right text-slate-400 pb-3">P&L</th>
                <th className="text-right text-slate-400 pb-3">P&L %</th>
                <th className="text-right text-slate-400 pb-3">Weight</th>
              </tr>
            </thead>
            <tbody>
              {metrics.portfolioBreakdown.map((stock, index) => (
                <tr key={stock.symbol} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-3 text-white font-medium">{stock.symbol}</td>
                  <td className="py-3 text-right text-slate-300">{stock.quantity}</td>
                  <td className="py-3 text-right text-slate-300">{formatCurrency(stock.averagePrice)}</td>
                  <td className="py-3 text-right text-slate-300">{formatCurrency(stock.currentPrice)}</td>
                  <td className="py-3 text-right text-white font-medium">{formatCurrency(stock.currentValue)}</td>
                  <td className={`py-3 text-right font-medium ${
                    stock.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stock.gainLoss >= 0 ? '+' : ''}{formatCurrency(stock.gainLoss)}
                  </td>
                  <td className={`py-3 text-right font-medium ${
                    stock.gainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stock.gainLossPercent >= 0 ? '+' : ''}{stock.gainLossPercent.toFixed(2)}%
                  </td>
                  <td className="py-3 text-right text-slate-300">{stock.weight.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

  // Enhanced loadAvailableSymbols with better error handling
  const loadAvailableSymbols = async () => {
    console.log('🔄 Loading available symbols...');
    setLoading(true);
    
    try {
      // Use your backend endpoint instead of direct market API call
      const url = `${API_BASE}/market-data/symbols`;
      console.log('📡 Calling backend API:', url);
      
      const symbols = await apiCall(url);
      console.log('📊 Backend API response:', symbols);
      
      if (symbols && Array.isArray(symbols) && symbols.length > 0) {
        const formattedSymbols = symbols.map((symbol, index) => ({
          symbol: typeof symbol === 'string' ? symbol : symbol.symbol || symbol.Symbol || `SYM_${index}`,
          companyName: typeof symbol === 'string' ? symbol : symbol.companyName || symbol.CompanyName || symbol.name || `Company ${index}`
        }));
        
        setAvailableSymbols(formattedSymbols);
        showSuccess(`✅ Loaded ${formattedSymbols.length} symbols from backend`);
        return;
      }
      
      // If no symbols returned, show message
      showError('❌ No symbols returned from backend');
      setAvailableSymbols([]);
      
    } catch (err) {
      console.error('❌ Failed to load symbols:', err);
      setAvailableSymbols([]);
      showError('❌ Failed to load symbols from backend. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };
  

  // Test market API connectivity
  const testMarketAPI = async () => {
    console.log('🧪 Testing Market API connectivity...');
    setLoading(true);
    
    try {
      // Test basic connectivity
      const testUrl = `${MARKET_API}/GetSymbolList`;
      console.log('🔍 Testing URL:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      console.log('📊 Test response status:', response.status);
      console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const text = await response.text();
        console.log('📄 Raw response text (first 500 chars):', text.substring(0, 500));
        
        try {
          const json = JSON.parse(text);
          console.log('✅ Successfully parsed JSON response');
          console.log('📊 Response type:', typeof json, 'Is Array:', Array.isArray(json));
          showSuccess('✅ Market API is accessible and returning data!');
        } catch (e) {
          console.log('⚠️ Response is not valid JSON');
          showError('⚠️ API accessible but returning non-JSON data');
        }
      } else {
        console.error('❌ API returned error status:', response.status);
        showError(`❌ API returned status ${response.status}`);
      }
      
    } catch (err) {
      console.error('❌ Market API test failed:', err);
      if (err.message.includes('Failed to fetch')) {
        showError('🌐 CORS or network error - API not accessible from browser');
      } else {
        showError(`❌ API test failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      console.log('🚀 Loading initial data...');
      await loadPortfolios();
      await loadAvailableSymbols();
      console.log('✅ Initial data load completed');
    } catch (err) {
      console.error('❌ Failed to load initial data:', err);
      showError('❌ Failed to load some initial data');
    } finally {
      setLoading(false);
    }
  };

  const validateOrderBeforeExecution = async (orderData) => {
    try {
      // Check if we have enough cash for BUY orders
      if (orderData.orderType === 'BUY') {
        const totalCost = orderData.quantity * orderData.price;
        if (selectedPortfolio.cashBalance < totalCost) {
          throw new Error(`Insufficient funds. Required: $${totalCost.toFixed(2)}, Available: $${selectedPortfolio.cashBalance.toFixed(2)}`);
        }
      }
      
      // Check if we have enough shares for SELL orders
      if (orderData.orderType === 'SELL') {
        const holding = stocks.find(stock => stock.symbol === orderData.symbol);
        if (!holding || holding.quantity < orderData.quantity) {
          throw new Error(`Insufficient shares. Required: ${orderData.quantity}, Available: ${holding ? holding.quantity : 0}`);
        }
      }
      
      return true;
    } catch (err) {
      throw err;
    }
  };
  
  const loadPortfolios = async () => {
    try {
      const data = await apiCall(`${API_BASE}/portfolios/user/${USER_ID}`);
      const portfolioArray = Array.isArray(data) ? data : [];
      setPortfolios(portfolioArray);
      
      // If we have a selected portfolio, refresh its data
      if (selectedPortfolio) {
        const updatedPortfolio = portfolioArray.find(p => p.id === selectedPortfolio.id);
        if (updatedPortfolio) {
          setSelectedPortfolio(updatedPortfolio);
        }
      } else if (portfolioArray.length > 0) {
        setSelectedPortfolio(portfolioArray[0]);
      }
      
      console.log('Loaded portfolios:', portfolioArray);
    } catch (err) {
      console.error('Failed to load portfolios:', err);
      setPortfolios([]);
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
      const data = await apiCall(`${API_BASE}/watchlist/portfolio/${portfolioId}`);
      setWatchlist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
      setWatchlist([]);
    }
  };

  const loadOrders = async (portfolioId) => {
    try {
      const data = await apiCall(`${API_BASE}/orders/portfolio/${portfolioId}`);
      const ordersArray = Array.isArray(data) ? data : [];
      setOrders(ordersArray);
      console.log('Loaded orders:', ordersArray);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setOrders([]);
      // Don't show error to user for this, as it might be expected
    }
  };

  const loadStocks = async (portfolioId) => {
    try {
      console.log(`🔄 Loading stocks for portfolio ${portfolioId}...`);
      const data = await apiCall(`${API_BASE}/stocks/portfolio/${portfolioId}`);
      console.log('📊 Raw stocks data:', data);
      
      let stocksArray = [];
      
      if (Array.isArray(data)) {
        stocksArray = data;
      } else if (data && typeof data === 'object') {
        // Handle case where API returns an object instead of array
        if (data.stocks && Array.isArray(data.stocks)) {
          stocksArray = data.stocks;
        } else if (data.holdings && Array.isArray(data.holdings)) {
          stocksArray = data.holdings;
        } else {
          // Convert single object to array
          stocksArray = [data];
        }
      }
      
      // Ensure each stock has required properties
      stocksArray = stocksArray.map(stock => ({
        id: stock.id || stock.stockId || `${stock.symbol}_${Date.now()}`,
        symbol: stock.symbol || '',
        quantity: parseInt(stock.quantity) || 0,
        averagePrice: parseFloat(stock.averagePrice || stock.avgPrice || stock.price) || 0,
        currentPrice: parseFloat(stock.currentPrice || stock.price || stock.averagePrice) || 0,
        portfolioId: stock.portfolioId || portfolioId,
        ...stock
      }));
      
      console.log(`✅ Processed ${stocksArray.length} stock holdings:`, stocksArray);
      setStocks(stocksArray);
      
      // Update market data for held stocks
      if (stocksArray.length > 0) {
        for (const stock of stocksArray) {
          if (!marketData[stock.symbol]) {
            getSymbolPrice(stock.symbol).then(priceData => {
              if (priceData) {
                setMarketData(prev => ({...prev, [stock.symbol]: priceData}));
              }
            });
          }
        }
      }
      
    } catch (err) {
      console.error('❌ Failed to load stocks:', err);
      setStocks([]);
      // Don't show error to user as this might be expected for new portfolios
    }
  };
  
  const validateSellOrder = (symbol, requestedQuantity) => {
    console.log(`🔍 Validating sell order for ${symbol}, quantity: ${requestedQuantity}`);
    console.log('📊 Current stocks:', stocks);
    
    const holding = stocks.find(stock => 
      stock.symbol?.toUpperCase() === symbol?.toUpperCase() && 
      stock.quantity > 0
    );
    
    console.log(`📈 Found holding for ${symbol}:`, holding);
    
    if (!holding) {
      throw new Error(`❌ No holdings found for ${symbol}. You don't own any shares of this stock.`);
    }
    
    const availableShares = parseInt(holding.quantity) || 0;
    const requestedShares = parseInt(requestedQuantity) || 0;
    
    if (requestedShares > availableShares) {
      throw new Error(`❌ Insufficient shares! You own ${availableShares} shares but trying to sell ${requestedShares} shares of ${symbol}`);
    }
    
    if (requestedShares <= 0) {
      throw new Error(`❌ Invalid quantity! Must sell at least 1 share.`);
    }
    
    console.log(`✅ Sell validation passed for ${symbol}: ${requestedShares}/${availableShares} shares`);
    return { holding, availableShares, requestedShares };
  };

  const loadTransactions = async (portfolioId) => {
    try {
      const data = await apiCall(`${API_BASE}/transactions/portfolio/${portfolioId}`);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setTransactions([]);
    }
  };

  // Enhanced getSymbolPrice with better error handling
  const getSymbolPrice = async (symbol) => {
    try {
      console.log(`💰 Getting price for symbol: ${symbol}`);
      // Use your backend endpoint instead of direct market API
      const priceData = await apiCall(`${API_BASE}/market-data/price/${symbol}`);
      console.log(`📊 Price data for ${symbol}:`, priceData);
      
      if (priceData && (priceData.price || priceData.Price)) {
        return {
          symbol: symbol,
          price: parseFloat(priceData.price || priceData.Price || 0),
          timeStamp: priceData.timeStamp || priceData.TimeStamp || new Date().toLocaleString(),
          ...priceData
        };
      }
      
      console.warn(`⚠️ No valid price data found for ${symbol}`);
      return null;
    } catch (err) {
      console.error(`❌ Failed to get price for ${symbol}:`, err);
      return null;
    }
  };

  // Get historical prices for a symbol
  const getSymbolHistory = async (symbol, count = 20) => {
    try {
      // Use your backend endpoint for historical data
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

  const updateMarketData = async () => {
    if (watchlist.length === 0) {
      showError('No symbols in watchlist to update');
      return;
    }
    
    const newMarketData = { ...marketData };
    const newPriceHistory = { ...priceHistory };
    let successCount = 0;
    
    for (const item of watchlist) {
      try {
        const [currentPrice, historicalPrices] = await Promise.all([
          getSymbolPrice(item.symbol),
          getSymbolHistory(item.symbol, 20)
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
    
    setMarketData(newMarketData);
    setPriceHistory(newPriceHistory);
    
    if (successCount > 0) {
      showSuccess(`Updated prices for ${successCount} symbols`);
    } else {
      showError('Failed to update any symbol prices');
    }
  };

  const createPortfolio = async () => {
    if (!portfolioForm.name.trim()) {
      showError('Please enter a portfolio name');
      return;
    }
    
    try {
      setLoading(true);
      const url = `${API_BASE}/portfolios?userId=${USER_ID}&portfolioName=${encodeURIComponent(portfolioForm.name)}&initialCash=${portfolioForm.initialCash}`;
      const response = await apiCall(url, { method: 'POST' });
      
      console.log('Portfolio creation response:', response);
      setPortfolioForm({ name: '', initialCash: 10000 });
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
    if (!selectedPortfolio) {
      showError('Please select a portfolio first');
      return;
    }
    
    // Check if already in watchlist
    if (watchlist.some(item => item.symbol === symbol)) {
      showError(`${symbol} is already in your watchlist`);
      return;
    }
    
    try {
      const url = `${API_BASE}/watchlist?portfolioId=${selectedPortfolio.id}&symbol=${symbol}&companyName=${encodeURIComponent(companyName)}`;
      await apiCall(url, { method: 'POST' });
      
      await loadWatchlist(selectedPortfolio.id);
      showSuccess(`Added ${symbol} to watchlist!`);
      
      // Get initial price for the new symbol
      setTimeout(() => {
        getSymbolPrice(symbol).then(priceData => {
          if (priceData) {
            setMarketData(prev => ({...prev, [symbol]: priceData}));
          }
        });
      }, 500);
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
      showError('Failed to add to watchlist. Please try again.');
    }
  };

  const removeFromWatchlist = async (symbol) => {
    if (!selectedPortfolio) return;
    
    try {
      await apiCall(`${API_BASE}/watchlist/portfolio/${selectedPortfolio.id}/symbol/${symbol}`, {
        method: 'DELETE'
      });
      
      await loadWatchlist(selectedPortfolio.id);
      showSuccess(`Removed ${symbol} from watchlist!`);
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
      showError('Failed to remove from watchlist. Please try again.');
    }
  };

  const submitOrder = async () => {
    if (!selectedPortfolio) {
      showError('❌ Please select a portfolio first');
      return;
    }
  
    setLoading(true);
    try {
      // Process manual tradeForm order
      if (tradeForm.symbol && tradeForm.quantity && tradeForm.price) {
        const quantity = parseInt(tradeForm.quantity, 10);
        const price = parseFloat(tradeForm.price);
        const symbol = tradeForm.symbol.toUpperCase();
        const totalAmount = quantity * price;

        if (quantity <= 0 || isNaN(quantity)) {
          showError('❌ Quantity must be a positive number');
          return;
        }
        if (price <= 0 || isNaN(price)) {
          showError('❌ Price must be a positive number');
          return;
        }
  
        // Enhanced validation for different order types
        if (tradeForm.orderType === 'BUY') {
          const totalCost = quantity * price;
          const availableCash = selectedPortfolio.cashBalance || selectedPortfolio.initialCash || 0;
          
          if (totalCost > availableCash) {
            showError(`❌ Insufficient funds! Required: ${formatCurrency(totalCost)}, Available: ${formatCurrency(availableCash)}`);
            return;
          }
        } else if (tradeForm.orderType === 'SELL') {
          try {
            // Use enhanced validation
            validateSellOrder(symbol, quantity);
          } catch (validationError) {
            showError(validationError.message);
            return;
          }
        }
  
        await processSingleOrder({
          portfolioId: selectedPortfolio.id,
          symbol: symbol,
          orderType: tradeForm.orderType,
          quantity,
          price
        });

        const transaction = {
            id: Date.now(),
            portfolioId: selectedPortfolio.id,
            symbol: tradeForm.symbol,
            type: tradeForm.orderType,
            quantity: quantity,
            price: price,
            totalAmount: totalAmount,
            timestamp: new Date().toISOString()
          };
  
        showOrderFeedback(tradeForm.orderType, tradeForm.symbol, quantity, price, totalAmount);
    
        // Reset trade form after processing
        setTradeForm({ symbol: '', orderType: 'BUY', quantity: '', price: '' });
      }
  
      // Process pending orders (if any)
      const pendingOrders = orders.filter(o => o.status === 'PENDING');
      console.log(`📝 Found ${pendingOrders.length} pending orders to process...`);
  
      for (const order of pendingOrders) {
        const quantity = parseInt(order.quantity, 10);
        const price = parseFloat(order.price);
        const symbol = order.symbol.toUpperCase();
        
        if (quantity <= 0 || isNaN(quantity) || price <= 0 || isNaN(price)) {
          console.warn(`⚠️ Skipping invalid order: ${order.id}`);
          continue;
        }
  
        // Validate each pending order
        try {
          if (order.orderType === 'SELL') {
            validateSellOrder(symbol, quantity);
          } else if (order.orderType === 'BUY') {
            const totalCost = quantity * price;
            const availableCash = selectedPortfolio.cashBalance || selectedPortfolio.initialCash || 0;
            if (totalCost > availableCash) {
              console.warn(`⚠️ Skipping order ${order.id}: Insufficient funds`);
              continue;
            }
          }
        } catch (validationError) {
          console.warn(`⚠️ Skipping order ${order.id}: ${validationError.message}`);
          continue;
        }
  
        await processSingleOrder({
          portfolioId: selectedPortfolio.id,
          symbol: symbol,
          orderType: order.orderType,
          quantity,
          price
        });
      }
  
      // Refresh data after all orders processed
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadPortfolios();
      if (selectedPortfolio) {
        await loadPortfolioData(selectedPortfolio.id);
      }
    } catch (err) {
      console.error('❌ Order process failed:', err);
      showError(`❌ Order failed: ${err.message}`);
    } finally {
      setLoading(false);
      console.log('🏁 Order submission process completed');
    }
  };

  
  const renderTradeFormValidation = () => {
    if (!tradeForm.symbol || !tradeForm.quantity) return null;
    
    const quantity = parseInt(tradeForm.quantity);
    const symbol = tradeForm.symbol.toUpperCase();
    
    if (tradeForm.orderType === 'SELL') {
      const holding = stocks.find(s => 
        s.symbol?.toUpperCase() === symbol && s.quantity > 0
      );
      const availableShares = holding ? holding.quantity : 0;
      
      return (
        <div className="space-y-2 mt-4">
          <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Available to sell:</span>
              <span className={`font-semibold ${availableShares >= quantity ? 'text-green-400' : 'text-red-400'}`}>
                {availableShares} shares
              </span>
            </div>
            {holding && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-400">Avg. cost basis:</span>
                <span className="text-slate-300">{formatCurrency(holding.averagePrice)}</span>
              </div>
            )}
          </div>
          
          {quantity > availableShares && (
            <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-900/20 p-2 rounded">
              <AlertCircle size={16} />
              <span>Insufficient shares! You only own {availableShares} shares.</span>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  
  // Helper function to process one order (create + execute)
  const processSingleOrder = async (orderData) => {
    let createdOrderId = null;
    try {
      console.log('📊 Order data to submit:', orderData);
  
      // Step 1: Create order
      const orderResponse = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(orderData)
      });
  
      const orderText = await orderResponse.text();
      let createdOrder;
      try {
        createdOrder = JSON.parse(orderText);
      } catch {
        throw new Error(`Invalid JSON from create order API: ${orderText}`);
      }
  
      if (!orderResponse.ok) {
        throw new Error(createdOrder.message || `Failed to create order (${orderResponse.status})`);
      }
  
      createdOrderId = createdOrder.id || createdOrder.orderId || createdOrder.orderID;
      if (!createdOrderId) {
        throw new Error(`No order ID in create order response: ${orderText}`);
      }
      console.log(`✅ Order created with ID: ${createdOrderId}`);
  
      // Step 2: Execute order
      await new Promise(resolve => setTimeout(resolve, 1000));
      const executeResponse = await fetch(`${API_BASE}/orders/${createdOrderId}/execute`, { method: 'PUT' });
  
      const executeText = await executeResponse.text();
      let executionResult;
      try {
        executionResult = JSON.parse(executeText);
      } catch {
        executionResult = { message: executeText };
      }
  
      if (!executeResponse.ok) {
        throw new Error(executionResult.message || `Execution failed (${executeResponse.status})`);
      }
  
      console.log(`✅ Order ${createdOrderId} executed successfully:`, executionResult);
  
      // Success notification
      showSuccess(`🎉 ${orderData.orderType} Order Executed Successfully!
  📈 Symbol: ${orderData.symbol}
  📊 Quantity: ${orderData.quantity} shares
  💰 Price: ${formatCurrency(orderData.price)} per share
  💵 Total: ${formatCurrency(orderData.quantity * orderData.price)}
  📋 Order ID: ${createdOrderId}`);
    } catch (err) {
      console.error(`❌ Failed processing order ${createdOrderId || ''}`, err);
      showError(`❌ Order failed: ${err.message}`);
    }
  };
  


  
  
  

  const fillCurrentPrice = async (symbol) => {
    if (!symbol) return;
    
    try {
      setLoading(true);
      console.log(`💰 Fetching price for ${symbol} from backend...`);
      
      // Call your backend instead of direct market API
      const priceData = await getSymbolPrice(symbol);
      if (priceData && priceData.price) {
        setTradeForm(prev => ({
          ...prev,
          symbol: symbol,
          price: priceData.price.toString()
        }));
        
        // Update market data
        setMarketData(prev => ({...prev, [symbol]: priceData}));
        
        showSuccess(`✅ Loaded current price for ${symbol}: ${formatCurrency(priceData.price)}`);
        return;
      }
      
      showError(`❌ Could not fetch price for ${symbol} from backend`);
      
    } catch (err) {
      console.error('❌ Failed to get price:', err);
      showError(`❌ Could not fetch price for ${symbol}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const safeJsonParse = (text, fallback = null) => {
    try {
      if (!text || !text.trim()) {
        return fallback;
      }
      return JSON.parse(text);
    } catch (error) {
      console.warn('Failed to parse JSON:', error);
      console.warn('Raw text:', text);
      return fallback;
    }
  };
  

  const refreshData = async () => {
    setLoading(true);
    try {
      await loadInitialData();
      if (selectedPortfolio) {
        await loadPortfolioData(selectedPortfolio.id);
      }
      await updateMarketData();
    } catch (err) {
      console.error('Failed to refresh data:', err);
      showError('Failed to refresh some data. Please check connections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPortfolio) {
      loadPortfolioData(selectedPortfolio.id);
    }
  }, [selectedPortfolio]);



  const testBackendMarketAPI = async () => {
    console.log('🧪 Testing Backend Market API connectivity...');
    setLoading(true);
    
    try {
      // Test your backend market data endpoint
      const testUrl = `${API_BASE}/market-data/symbols`;
      console.log('🔍 Testing Backend URL:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      console.log('📊 Test response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Successfully got data from backend');
        showSuccess('✅ Backend Market API is accessible and returning data!');
      } else {
        console.error('❌ Backend API returned error status:', response.status);
        showError(`❌ Backend API returned status ${response.status}`);
      }
      
    } catch (err) {
      console.error('❌ Backend Market API test failed:', err);
      showError(`❌ Backend API test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testBackendConnection = async () => {
    console.log('🧪 Testing backend connection...');
    setLoading(true);
    
    try {
      // Test portfolios endpoint
      const portfoliosResponse = await fetch(`${API_BASE}/portfolios/user/${USER_ID}`);
      console.log('📊 Portfolios endpoint status:', portfoliosResponse.status);
      
      if (portfoliosResponse.ok) {
        showSuccess('✅ Backend connection successful!');
        await loadInitialData();
      } else {
        throw new Error(`Backend returned status ${portfoliosResponse.status}`);
      }
      
    } catch (err) {
      console.error('❌ Backend test failed:', err);
      showError(`❌ Backend connection failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // 5. Update your useEffect to ensure symbols load:
  
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing app...');
      setLoading(true);
      
      try {
        // Load symbols first (with fallback)
        await loadAvailableSymbols();
        
        // Then load portfolios
        await loadPortfolios();
        
        console.log('✅ App initialized successfully');
      } catch (err) {
        console.error('❌ App initialization failed:', err);
        showError('⚠️ Some features may not work properly');
      } finally {
        setLoading(false);
      }
    };
    
    initializeApp();
  }, []);
  
  // 6. Add this debug button to your UI (temporary, for testing):
  
  const renderDebugPanel = () => (
    <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-4">
      <h3 className="text-yellow-400 font-semibold mb-2">🔧 Debug Panel</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
        <div>
          <div className="text-yellow-300">Symbols:</div>
          <div className="text-white">{availableSymbols.length}</div>
        </div>
        <div>
          <div className="text-yellow-300">Portfolios:</div>
          <div className="text-white">{portfolios.length}</div>
        </div>
        <div>
          <div className="text-yellow-300">Selected:</div>
          <div className="text-white">{selectedPortfolio ? selectedPortfolio.name : 'None'}</div>
        </div>
        <div>
          <div className="text-yellow-300">Backend:</div>
          <div className="text-white">{API_BASE}</div>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={testBackendConnection}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          Test Backend
        </button>
        <button
          onClick={loadAvailableSymbols}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
        >
          Reload Symbols
        </button>
        <button
          onClick={() => console.log('Debug Info:', { availableSymbols, portfolios, selectedPortfolio, marketData })}
          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
        >
          Log Debug
        </button>
      </div>
    </div>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getPriceChange = (symbol) => {
    const history = priceHistory[symbol];
    if (!history || history.length < 2) return { change: 0, percent: 0 };
    
    const current = history[history.length - 1]?.price || 0;
    const previous = history[history.length - 2]?.price || 0;
    const change = current - previous;
    const percent = previous ? (change / previous) * 100 : 0;
    
    return { change, percent };
  };

  // Enhanced filtered symbols with useMemo for better performance
  const filteredSymbols = useMemo(() => {
    if (!searchTerm.trim()) {
      return availableSymbols;
    }
    
    const term = searchTerm.toLowerCase();
    return availableSymbols.filter(symbol => 
      symbol.symbol.toLowerCase().includes(term) ||
      (symbol.companyName && symbol.companyName.toLowerCase().includes(term))
    );
  }, [availableSymbols, searchTerm]);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Portfolio Stats */}
      {selectedPortfolio && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 border border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Value</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(selectedPortfolio.totalValue || selectedPortfolio.initialCash)}
                </p>
              </div>
              <div className="p-3 bg-blue-700/50 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-200" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-6 border border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">Cash Balance</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(selectedPortfolio.cashBalance || selectedPortfolio.initialCash)}
                </p>
              </div>
              <div className="p-3 bg-green-700/50 rounded-lg">
                <Wallet className="h-6 w-6 text-green-200" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-xl p-6 border border-purple-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Holdings</p>
                <p className="text-2xl font-bold text-white">{stocks.length}</p>
              </div>
              <div className="p-3 bg-purple-700/50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-200" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-800 to-orange-900 rounded-xl p-6 border border-orange-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-medium">Watchlist</p>
                <p className="text-2xl font-bold text-white">{watchlist.length}</p>
              </div>
              <div className="p-3 bg-orange-700/50 rounded-lg">
                <Eye className="h-6 w-6 text-orange-200" />
              </div>
            </div>
          </div>
        </div>
      )}


    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Overview */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Activity className="mr-1" />
            Portfolio Performance
          </h2>
          {/* NEW: Holdings Distribution Chart Changes MADE HERE */}
         {selectedPortfolio && stocks.length > 0 && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                🥧 Holdings Distribution
              </h2>
              <HoldingsChart
                holdings={holdingsForChart}
                onSelectStock={setSelectedStockSymbol}
              />

              {selectedStockSymbol && (
                <StockAnalysisPanel
                  symbol={selectedStockSymbol}
                  stocks={stocks}
                  transactions={transactions}
                  priceHistory={priceHistory[selectedStockSymbol] || []}
                  livePrice={liveStockPrice}
                  onClose={() => setSelectedStockSymbol(null)}
                />
              )}
            </div>
          )}
          

          
          {/* Price Chart */}
          {priceHistory[watchlist[0]?.symbol] && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                {watchlist[0]?.symbol} - Price Movement
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={priceHistory[watchlist[0]?.symbol]}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#10b981" 
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Transactions */}
          {transactions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Recent Transactions</h3>
              <div className="space-y-2">
                {transactions.slice(0, 5).map((transaction, index) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg p-3 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.type === 'BUY' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <span className="text-white font-medium">{transaction.symbol}</span>
                      <span className="text-slate-400">{transaction.quantity} shares</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {formatCurrency(transaction.totalAmount)}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trading Panel */}
        <div className="space-y-6">
          {/* Quick Trade */}
          <div className="bg-gradient-to-br from-ivory-800 to-ivory-900 rounded-xl p-6 border border-indigo-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <ShoppingCart className="mr-2" />
              Trade 
              
            </h3>

            
            
           
          <div className="space-y-4">
            
            <div className="relative">
              <select
                value={tradeForm.symbol}
                onChange={(e) => setTradeForm({...tradeForm, symbol: e.target.value})}
                className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Select Symbol ({availableSymbols.length} available)</option>
                {availableSymbols.slice(0, 50).map(symbol => (
                  <option key={symbol.symbol} value={symbol.symbol}>
                    {symbol.symbol} - {symbol.companyName}
                  </option>
                ))}
              </select>
              {tradeForm.symbol && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <button
                    onClick={() => fillCurrentPrice(tradeForm.symbol)}
                    className="text-indigo-400 hover:text-indigo-300 text-xs bg-slate-600 px-2 py-1 rounded transition-colors"
                    disabled={loading}
                  >
                    {loading ? '...' : 'Get Price'}
                  </button>
                </div>
              )}
            </div>

            {/* Current Price Display */}
            {tradeForm.symbol && marketData[tradeForm.symbol] && (
              <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Current Market Price:</span>
                  <span className="text-green-400 font-semibold">
                    {formatCurrency(marketData[tradeForm.symbol].price)}
                  </span>
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  Last updated: {marketData[tradeForm.symbol].timeStamp}
                </div>
              </div>
            )}

            {/* Order Type Selection */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTradeForm({...tradeForm, orderType: 'BUY'})}
                className={`p-3 rounded-lg font-semibold transition-all duration-200 ${
                  tradeForm.orderType === 'BUY' 
                    ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-400/50' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                disabled={loading}
              >
                <div className="flex items-center justify-center h-full">
                  <span className="flex items-center justify-center space-x-2">
                    {loading && tradeForm.orderType === 'BUY' && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span>BUY</span>
                  </span>
                </div>
              </button>

              <button
                onClick={() => setTradeForm({...tradeForm, orderType: 'SELL'})}
                className={`p-3 rounded-lg font-semibold transition-all duration-200 ${
                  tradeForm.orderType === 'SELL' 
                    ? 'bg-red-600 text-white shadow-lg ring-2 ring-red-400/50' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                disabled={loading}
              >
                <span className="flex items-center justify-center space-x-2">
                  {loading && tradeForm.orderType === 'SELL' && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>SELL</span>
                </span>
              </button>
            </div>

            <OrderSuccessPopup />

            {/* Quantity Input with Validation */}
            <div className="space-y-1">
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Quantity (e.g., 10)"
                value={tradeForm.quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow positive integers
                  if (value === '' || (parseInt(value) > 0 && !isNaN(parseInt(value)))) {
                    setTradeForm({...tradeForm, quantity: value});
                  }
                }}
                className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-indigo-500 focus:outline-none"
                disabled={loading}
              />
              
            </div>

            {/* Price Input with Market Price Helper */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Price per share (e.g., 150.00)"
                  value={tradeForm.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow decimal numbers
                    if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) > 0)) {
                      setTradeForm({...tradeForm, price: value});
                    }
                  }}
                  className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-indigo-500 focus:outline-none pr-20"
                  disabled={loading}
                />
                {tradeForm.symbol && marketData[tradeForm.symbol] && (
                  <button
                    onClick={() => setTradeForm({
                      ...tradeForm, 
                      price: marketData[tradeForm.symbol].price.toString()
                    })}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-400 hover:text-indigo-300 text-xs bg-slate-600 px-2 py-1 rounded"
                  >
                    Use Market
                  </button>
                )}
              </div>
              {tradeForm.symbol && marketData[tradeForm.symbol] && tradeForm.price && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">
                    Market: {formatCurrency(marketData[tradeForm.symbol].price)}
                  </span>
                  <span className={`${
                    parseFloat(tradeForm.price) > marketData[tradeForm.symbol].price 
                      ? 'text-red-400' 
                      : parseFloat(tradeForm.price) < marketData[tradeForm.symbol].price 
                      ? 'text-green-400' 
                      : 'text-slate-400'
                  }`}>
                    {parseFloat(tradeForm.price) > marketData[tradeForm.symbol].price && '↑ Above Market'}
                    {parseFloat(tradeForm.price) < marketData[tradeForm.symbol].price && '↓ Below Market'}
                    {parseFloat(tradeForm.price) === marketData[tradeForm.symbol].price && '= At Market'}
                  </span>
                </div>
              )}
            </div>

            {/* Enhanced Order Summary */}
            {tradeForm.symbol && tradeForm.quantity && tradeForm.price && (
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Order Summary:</span>
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                    tradeForm.orderType === 'BUY' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                  }`}>
                    {tradeForm.orderType}
                  </div>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Symbol:</span>
                    <span className="text-white font-semibold">{tradeForm.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quantity:</span>
                    <span className="text-white">{tradeForm.quantity} shares</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Price per share:</span>
                    <span className="text-white">{formatCurrency(parseFloat(tradeForm.price))}</span>
                  </div>
                  <div className="border-t border-slate-600 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300 font-medium">Total Cost:</span>
                      <span className="text-white font-bold">
                        {formatCurrency(parseFloat(tradeForm.quantity) * parseFloat(tradeForm.price))}
                      </span>
                    </div>
                  </div>
                  
                  {/* Balance Check for BUY orders */}
                  {tradeForm.orderType === 'BUY' && selectedPortfolio && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-slate-400">Available Cash:</span>
                      <span className={`${
                        (selectedPortfolio.cashBalance || selectedPortfolio.initialCash) >= 
                        (parseFloat(tradeForm.quantity) * parseFloat(tradeForm.price))
                          ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(selectedPortfolio.cashBalance || selectedPortfolio.initialCash)}
                      </span>
                    </div>
                  )}

                  {/* Stock Check for SELL orders */}
                  {tradeForm.orderType === 'SELL' && tradeForm.symbol && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-slate-400">Shares Owned:</span>
                      <span className={`${
                        (stocks.find(s => s.symbol === tradeForm.symbol)?.quantity || 0) >= parseInt(tradeForm.quantity)
                          ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {stocks.find(s => s.symbol === tradeForm.symbol)?.quantity || 0} shares
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Execute Button */}
            <button
              onClick={submitOrder}
              disabled={
                loading || 
                !tradeForm.symbol || 
                !tradeForm.quantity || 
                !tradeForm.price ||
                !selectedPortfolio ||
                (tradeForm.orderType === 'BUY' && 
                  (selectedPortfolio.cashBalance || selectedPortfolio.initialCash) < 
                  (parseFloat(tradeForm.quantity || 0) * parseFloat(tradeForm.price || 0))) ||
                (tradeForm.orderType === 'SELL' && 
                  (stocks.find(s => s.symbol === tradeForm.symbol)?.quantity || 0) < 
                  parseInt(tradeForm.quantity || 0))
              }
              className={`w-full font-bold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                tradeForm.orderType === 'BUY' 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white' 
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  <span>{tradeForm.orderType === 'BUY' ? 'Execute Buy Order' : 'Execute Sell Order'}</span>
                </>
              )}
            </button>

            {/* Order Validation Messages */}
            {tradeForm.symbol && tradeForm.quantity && tradeForm.price && selectedPortfolio && (
              <div className="space-y-1">
                {tradeForm.orderType === 'BUY' && 
                  (selectedPortfolio.cashBalance || selectedPortfolio.initialCash) < 
                  (parseFloat(tradeForm.quantity) * parseFloat(tradeForm.price)) && (
                  <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-900/20 p-2 rounded">
                    <AlertCircle size={16} />
                    <span>Insufficient funds for this purchase</span>
                  </div>
                )}
                
                {tradeForm.orderType === 'SELL' && 
                  (stocks.find(s => s.symbol === tradeForm.symbol)?.quantity || 0) < 
                  parseInt(tradeForm.quantity) && (
                  <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-900/20 p-2 rounded">
                    <AlertCircle size={16} />
                    <span>Insufficient shares for this sale</span>
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
          {/* Watchlist */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Eye className="mr-2" />
                Watchlist ({watchlist.length})
              </h3>
              <button
                onClick={updateMarketData}
                className="text-indigo-400 hover:text-indigo-300 p-2 rounded"
                title="Update Prices"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {watchlist.map(item => {
                const currentData = marketData[item.symbol];
                const priceChange = getPriceChange(item.symbol);
                
                return (
                  <div key={item.id} className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-white">{item.symbol}</div>
                        <div className="text-sm text-slate-400 truncate">{item.companyName}</div>
                      </div>
                      <div className="text-right ml-2">
                        <div className="font-semibold text-white">
                          {currentData ? formatCurrency(currentData.price) : (
                            <button 
                              onClick={() => getSymbolPrice(item.symbol).then(data => {
                                if (data) setMarketData(prev => ({...prev, [item.symbol]: data}));
                              })}
                              className="text-indigo-400 hover:text-indigo-300 text-sm"
                            >
                              Load Price
                            </button>
                          )}
                        </div>
                        {currentData && (
                          <div className={`text-sm flex items-center justify-end ${
                            priceChange.percent >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {priceChange.percent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span className="ml-1">{priceChange.percent.toFixed(2)}%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1 ml-2">
                        <button
                          onClick={() => {
                            setTradeForm({
                              ...tradeForm,
                              symbol: item.symbol,
                              price: currentData ? currentData.price.toString() : ''
                            });
                          }}
                          className="text-indigo-400 hover:text-indigo-300 p-1 text-xs"
                          title="Quick Trade"
                        >
                          <ShoppingCart size={14} />
                        </button>
                        <button
                          onClick={() => removeFromWatchlist(item.symbol)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Remove from watchlist"
                        >
                          <Minus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {watchlist.length === 0 && (
                <div className="text-center text-slate-400 py-8">
                  <Eye className="mx-auto mb-3 opacity-50" size={48} />
                  <p>No symbols in watchlist</p>
                  <p className="text-sm">Add symbols from the Market tab</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPortfolios = () => (
    <div className="space-y-6">
      {/* Create Portfolio */}
      <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-6 border border-green-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Plus className="mr-2" />
          Create New Portfolio
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Portfolio Name"
            value={portfolioForm.name}
            onChange={(e) => setPortfolioForm({...portfolioForm, name: e.target.value})}
            className="bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-green-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Initial Cash"
            value={portfolioForm.initialCash}
            onChange={(e) => setPortfolioForm({...portfolioForm, initialCash: parseFloat(e.target.value) || 0})}
            className="bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-green-500 focus:outline-none"
          />
          <button
            onClick={createPortfolio}
            disabled={loading}
            className="bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Portfolio'}
          </button>
        </div>
      </div>

      {/* Portfolio List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map(portfolio => (
          <div 
            key={portfolio.id} 
            className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border cursor-pointer transition-all hover:scale-105 ${
              selectedPortfolio?.id === portfolio.id 
                ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl' 
                : 'border-slate-700 hover:border-slate-600'
            }`}
            onClick={() => setSelectedPortfolio(portfolio)}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{portfolio.name}</h3>
              {selectedPortfolio?.id === portfolio.id && (
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center">
                  <DollarSign size={16} className="mr-1" />
                  Total Value:
                </span>
                <span className="text-green-400 font-semibold">
                  {formatCurrency(portfolio.totalValue || portfolio.initialCash)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center">
                  <Wallet size={16} className="mr-1" />
                  Cash:
                </span>
                <span className="text-blue-400 font-semibold">
                  {formatCurrency(portfolio.cashBalance || portfolio.initialCash)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center">
                  <Calendar size={16} className="mr-1" />
                  Created:
                </span>
                <span className="text-slate-300 text-sm">
                  {portfolio.createdDate ? new Date(portfolio.createdDate).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </div>

            {selectedPortfolio?.id === portfolio.id && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="text-center text-indigo-400 font-medium">
                  ✓ Active Portfolio
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {portfolios.length === 0 && !loading && (
        <div className="text-center text-slate-400 py-12">
          <Wallet className="mx-auto mb-4 opacity-50" size={64} />
          <h3 className="text-xl font-medium mb-2">No Portfolios Found</h3>
          <p>Create your first portfolio to start trading</p>
        </div>
      )}
    </div>
  );

  //const renderMarket = () => (
    <div className="space-y-6">
      {/* Debug Panel */}
      <div className="bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-xl p-4 border border-yellow-700">
        <h3 className="text-lg font-bold text-white mb-3">🔧 Debug Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-yellow-200">Available Symbols:</div>
            <div className="text-white font-semibold">{availableSymbols.length}</div>
          </div>
          <div>
            <div className="text-yellow-200">Filtered Symbols:</div>
            <div className="text-white font-semibold">{filteredSymbols.length}</div>
          </div>
          <div>
            <div className="text-yellow-200">Market Data Keys:</div>
            <div className="text-white font-semibold">{Object.keys(marketData).length}</div>
          </div>
          <div>
            <div className="text-yellow-200">Loading Status:</div>
            <div className="text-white font-semibold">{loading ? '🔄 Loading' : '✅ Ready'}</div>
          </div>
        </div>
        <div className="mt-3 flex space-x-2">
          <button
            onClick={testMarketAPI}
            className="bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 transition-colors"
          >
            🧪 Test API Connection
          </button>
          <button
            onClick={() => {
              console.log('Available Symbols:', availableSymbols);
              console.log('Market Data:', marketData);
              console.log('API URLs:', { MARKET_API, API_BASE });
            }}
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            📊 Log Debug Info
          </button>
        </div>
      </div>

      {/* Search and Symbols Count */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <BarChart3 className="mr-3" />
            Market Data ({availableSymbols.length} symbols available)
          </h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search symbols..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-700 text-white rounded-lg pl-10 pr-4 py-2 border border-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                loadAvailableSymbols();
              }}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Reload Symbols
            </button>
          </div>
        </div>
        
        {searchTerm && (
          <div className="mt-2 text-slate-400 text-sm">
            Showing {filteredSymbols.length} of {availableSymbols.length} symbols
          </div>
        )}
      </div>

      {/* Market Data Grid */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredSymbols.slice(0, 100).map(symbol => {
            const currentData = marketData[symbol.symbol];
            const isInWatchlist = watchlist.some(item => item.symbol === symbol.symbol);
            
            return (
              <div key={symbol.symbol} className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-white">{symbol.symbol}</div>
                    <div className="text-sm text-slate-400 truncate" title={symbol.companyName}>
                      {symbol.companyName}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        if (isInWatchlist) {
                          removeFromWatchlist(symbol.symbol);
                        } else {
                          addToWatchlist(symbol.symbol, symbol.companyName);
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors text-xs ${
                        isInWatchlist 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                      title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      {isInWatchlist ? <Eye size={14} /> : <Plus size={14} />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Current Price:</span>
                    <span className="text-lg font-semibold text-white">
                      {currentData ? (
                        formatCurrency(currentData.price)
                      ) : (
                        <button 
                          onClick={() => getSymbolPrice(symbol.symbol).then(data => {
                            if (data) {
                              setMarketData(prev => ({...prev, [symbol.symbol]: data}));
                              showSuccess(`Loaded price for ${symbol.symbol}`);
                            }
                          })}
                          className="text-indigo-400 hover:text-indigo-300 text-sm bg-slate-600 px-2 py-1 rounded"
                        >
                          Load Price
                        </button>
                      )}
                    </span>
                  </div>
                  
                  {currentData && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Last Update:</span>
                      <span className="text-slate-300 text-sm">{currentData.timeStamp}</span>
                    </div>
                  )}

                  {tradeForm.symbol === symbol.symbol && (
                    <div className="mt-2 p-2 bg-indigo-900/50 rounded border border-indigo-700">
                      <div className="text-indigo-300 text-sm">✓ Selected for trading</div>
                    </div>
                  )}
                </div>

                {/* Quick action buttons */}
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => {
                      setTradeForm({
                        ...tradeForm, 
                        symbol: symbol.symbol,
                        price: currentData ? currentData.price.toString() : ''
                      });
                    }}
                    className="flex-1 bg-slate-600 text-white text-xs py-2 px-3 rounded hover:bg-slate-500 transition-colors"
                  >
                    Select
                  </button>
                  <button
                    onClick={() => {
                      if (currentData) {
                        setTradeForm({
                          symbol: symbol.symbol,
                          orderType: 'BUY',
                          quantity: '10',
                          price: currentData.price.toString()
                        });
                        setActiveTab('dashboard');
                      } else {
                        fillCurrentPrice(symbol.symbol).then(() => {
                          setTradeForm(prev => ({
                            ...prev,
                            symbol: symbol.symbol,
                            orderType: 'BUY',
                            quantity: '10'
                          }));
                          setActiveTab('dashboard');
                        });
                      }
                    }}
                    className="flex-1 bg-indigo-600 text-white text-xs py-2 px-3 rounded hover:bg-indigo-500 transition-colors"
                  >
                    Quick Buy
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {availableSymbols.length === 0 && !loading && (
          <div className="text-center text-slate-400 py-12">
            <BarChart3 className="mx-auto mb-4 opacity-50" size={64} />
            <h3 className="text-xl font-medium mb-2">No Market Data Available</h3>
            <p>Unable to load symbols from market data service</p>
            <button
              onClick={loadAvailableSymbols}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry Loading Symbols
            </button>
          </div>
        )}

        {filteredSymbols.length === 0 && availableSymbols.length > 0 && (
          <div className="text-center text-slate-400 py-12">
            <Search className="mx-auto mb-4 opacity-50" size={64} />
            <h3 className="text-xl font-medium mb-2">No symbols found</h3>
            <p>Try a different search term</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  //);

  const renderMarket =()=>(
    <div><StockDashboard/></div>
    )

  const renderOrders = () => (
    <div className="space-y-6">
      {/* Order Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-4 border border-blue-700">
          <div className="text-blue-200 text-sm">Total Orders</div>
          <div className="text-2xl font-bold text-white">{orders.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-4 border border-green-700">
          <div className="text-green-200 text-sm">Executed</div>
          <div className="text-2xl font-bold text-white">
            {orders.filter(o => o.status === 'EXECUTED' || o.orderStatus === 'EXECUTED').length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-xl p-4 border border-yellow-700">
          <div className="text-yellow-200 text-sm">Pending</div>
          <div className="text-2xl font-bold text-white">
            {orders.filter(o => o.status === 'PENDING' || o.orderStatus === 'PENDING').length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-800 to-red-900 rounded-xl p-4 border border-red-700">
          <div className="text-red-200 text-sm">Failed/Cancelled</div>
          <div className="text-2xl font-bold text-white">
            {orders.filter(o => ['FAILED', 'CANCELLED'].includes(o.status || o.orderStatus)).length}
          </div>
        </div>
      </div>
  
      {/* Orders List */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Target className="mr-3" />
            Order History ({orders.length})
          </h2>
          <button
            onClick={() => selectedPortfolio && loadOrders(selectedPortfolio.id)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
        </div>
        
        {orders.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {orders.map((order, index) => {
              // Handle both possible field names from backend
              const orderStatus = order.status || order.orderStatus || 'UNKNOWN';
              const orderType = order.orderType || 'UNKNOWN';
              const totalAmount = order.totalAmount || (order.quantity * order.price) || 0;
              const executedDate = order.executedAt || order.executedDate;
              const createdDate = order.createdDate;
              
              return (
                <div key={order.id || index} className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-4">
                      {/* Order Type Indicator */}
                      <div className={`w-3 h-3 rounded-full ${
                        orderType === 'BUY' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      
                      <div>
                        <div className="font-semibold text-white text-lg">
                          {orderType} {order.quantity} shares of {order.symbol}
                        </div>
                        <div className="text-slate-400 text-sm">
                          At {formatCurrency(order.price)} per share
                        </div>
                        <div className="text-slate-500 text-xs mt-1">
                          Order ID: {order.id}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-white text-lg">
                        {formatCurrency(totalAmount)}
                      </div>
                      <div className={`text-sm px-3 py-1 rounded-full font-medium ${
                        orderStatus === 'EXECUTED' ? 'bg-green-900/50 text-green-400 border border-green-600' :
                        orderStatus === 'PENDING' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-600' :
                        orderStatus === 'CANCELLED' ? 'bg-gray-900/50 text-gray-400 border border-gray-600' :
                        orderStatus === 'FAILED' ? 'bg-red-900/50 text-red-400 border border-red-600' :
                        'bg-slate-900/50 text-slate-400 border border-slate-600'
                      }`}>
                        {orderStatus}
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3 p-3 bg-slate-800/30 rounded">
                    <div>
                      <div className="text-slate-400">Quantity</div>
                      <div className="text-white font-medium">{order.quantity} shares</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Price per Share</div>
                      <div className="text-white font-medium">{formatCurrency(order.price)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Total Value</div>
                      <div className="text-white font-medium">{formatCurrency(totalAmount)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Status</div>
                      <div className={`font-medium ${
                        orderStatus === 'EXECUTED' ? 'text-green-400' :
                        orderStatus === 'PENDING' ? 'text-yellow-400' :
                        orderStatus === 'CANCELLED' ? 'text-gray-400' :
                        orderStatus === 'FAILED' ? 'text-red-400' :
                        'text-slate-400'
                      }`}>
                        {orderStatus}
                      </div>
                    </div>
                  </div>
  
                  {/* Timestamps */}
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-600 text-sm">
                    <div className="text-slate-400">
                      <span className="mr-4">
                        📅 Created: {createdDate ? new Date(createdDate).toLocaleString() : 'Unknown'}
                      </span>
                    </div>
                    {executedDate && orderStatus === 'EXECUTED' && (
                      <div className="text-green-400">
                        ✅ Executed: {new Date(executedDate).toLocaleString()}
                      </div>
                    )}
                  </div>
  
                  {/* Action Buttons for Pending Orders */}
                  {orderStatus === 'PENDING' && (
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={async () => {
                          try {
                            await apiCall(`${API_BASE}/orders/${order.id}/execute`, { method: 'PUT' });
                            showSuccess(`Order ${order.id} executed successfully!`);
                            if (selectedPortfolio) {
                              await loadOrders(selectedPortfolio.id);
                              await loadPortfolios();
                              await loadStocks(selectedPortfolio.id);
                            }
                          } catch (err) {
                            showError(`Failed to execute order: ${err.message}`);
                          }
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Execute
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await apiCall(`${API_BASE}/orders/${order.id}/cancel`, { method: 'PUT' });
                            showSuccess(`Order ${order.id} cancelled successfully!`);
                            if (selectedPortfolio) {
                              await loadOrders(selectedPortfolio.id);
                            }
                          } catch (err) {
                            showError(`Failed to cancel order: ${err.message}`);
                          }
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-12">
            <Target className="mx-auto mb-4 opacity-50" size={64} />
            <h3 className="text-xl font-medium mb-2">No Orders Yet</h3>
            <p className="mb-4">Your order history will appear here</p>
            {selectedPortfolio ? (
              <div className="text-sm text-slate-500">
                Selected Portfolio: {selectedPortfolio.name}
              </div>
            ) : (
              <div className="text-sm text-yellow-400">
                ⚠️ Please select a portfolio to view orders
              </div>
            )}
          </div>
        )}
      </div>
  
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <h3 className="text-yellow-400 font-semibold mb-2">🔧 Debug Info</h3>
          <div className="text-sm space-y-1">
            <div>Orders Array Length: {orders.length}</div>
            <div>Selected Portfolio: {selectedPortfolio?.name || 'None'}</div>
            <div>Portfolio ID: {selectedPortfolio?.id || 'N/A'}</div>
            {orders.length > 0 && (
              <div>Sample Order: {JSON.stringify(orders[0], null, 2)}</div>
            )}
          </div>
          <button
            onClick={() => {
              console.log('Orders Debug:', orders);
              console.log('Selected Portfolio:', selectedPortfolio);
            }}
            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 mt-2"
          >
            Log to Console
          </button>
        </div>
      )}
    </div>
  );

  const renderStocks = () => (
    <div className="space-y-6">
      {/* Debug info for stocks */}
      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
        <h3 className="text-yellow-400 font-semibold mb-2">🔧 Holdings Debug Info</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-yellow-300">Holdings Count:</div>
            <div className="text-white">{stocks.length}</div>
          </div>
          <div>
            <div className="text-yellow-300">Selected Portfolio:</div>
            <div className="text-white">{selectedPortfolio?.name || 'None'}</div>
          </div>
          <div>
            <div className="text-yellow-300">Portfolio ID:</div>
            <div className="text-white">{selectedPortfolio?.id || 'N/A'}</div>
          </div>
          <div>
            <div className="text-yellow-300">Last Loaded:</div>
            <div className="text-white">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
        <div className="mt-3 flex space-x-2">
          <button
            onClick={() => {
              console.log('🐛 DEBUG - Current stocks:', stocks);
              console.log('🐛 DEBUG - Selected portfolio:', selectedPortfolio);
              console.log('🐛 DEBUG - Market data:', marketData);
            }}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
          >
            Log Holdings Debug
          </button>
          <button
            onClick={() => selectedPortfolio && loadStocks(selectedPortfolio.id)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Reload Holdings
          </button>
        </div>
      </div>
  
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <BarChart3 className="mr-3" />
          Stock Holdings ({stocks.length})
        </h2>
        
        {stocks.length > 0 ? (
          <div className="space-y-4">
            {stocks.map((stock, index) => {
              const currentData = marketData[stock.symbol];
              const currentPrice = currentData ? currentData.price : stock.currentPrice;
              const totalValue = currentPrice * stock.quantity;
              const totalCost = stock.averagePrice * stock.quantity;
              const pnl = totalValue - totalCost;
              const pnlPercent = totalCost ? (pnl / totalCost) * 100 : 0;
  
              return (
                <div key={stock.id || index} className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-white text-lg">{stock.symbol}</div>
                      <div className="text-slate-400">
                        {stock.quantity} shares owned
                        {stock.averagePrice && (
                          <span className="ml-2 text-slate-500">
                            (avg: {formatCurrency(stock.averagePrice)})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        {formatCurrency(totalValue)}
                      </div>
                      <div className={`text-sm ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)} ({pnlPercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400">Avg. Price</div>
                      <div className="text-white font-medium">{formatCurrency(stock.averagePrice)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Current Price</div>
                      <div className="text-white font-medium">
                        {formatCurrency(currentPrice)}
                        {!currentData && (
                          <button
                            onClick={() => getSymbolPrice(stock.symbol)}
                            className="ml-2 text-indigo-400 hover:text-indigo-300 text-xs"
                          >
                            Update
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Total Cost</div>
                      <div className="text-white font-medium">{formatCurrency(totalCost)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Market Value</div>
                      <div className="text-white font-medium">{formatCurrency(totalValue)}</div>
                    </div>
                  </div>
  
                  {/* Enhanced sell buttons with validation */}
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => {
                        const sellPrice = currentPrice || stock.currentPrice || stock.averagePrice;
                        setTradeForm({
                          symbol: stock.symbol,
                          orderType: 'SELL',
                          quantity: stock.quantity.toString(),
                          price: sellPrice.toString()
                        });
                        setActiveTab('dashboard');
                      }}
                      disabled={stock.quantity <= 0}
                      className="bg-red-600 text-white text-sm py-2 px-4 rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sell All ({stock.quantity} shares)
                    </button>
                    <button
                      onClick={() => {
                        const halfQuantity = Math.floor(stock.quantity / 2);
                        const sellPrice = currentPrice || stock.currentPrice || stock.averagePrice;
                        setTradeForm({
                          symbol: stock.symbol,
                          orderType: 'SELL',
                          quantity: halfQuantity.toString(),
                          price: sellPrice.toString()
                        });
                        setActiveTab('dashboard');
                      }}
                      disabled={stock.quantity < 2}
                      className="bg-orange-600 text-white text-sm py-2 px-4 rounded hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sell Half ({Math.floor(stock.quantity / 2)} shares)
                    </button>
                    <button
                      onClick={() => {
                        setTradeForm({
                          symbol: stock.symbol,
                          orderType: 'SELL',
                          quantity: '',
                          price: (currentPrice || stock.currentPrice || stock.averagePrice).toString()
                        });
                        setActiveTab('dashboard');
                      }}
                      className="bg-slate-600 text-white text-sm py-2 px-4 rounded hover:bg-slate-700 transition-colors"
                    >
                      Custom Sell
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-12">
            <BarChart3 className="mx-auto mb-4 opacity-50" size={64} />
            <h3 className="text-xl font-medium mb-2">No Holdings Found</h3>
            <p>Your stock holdings will appear here after you buy stocks</p>
            {selectedPortfolio && (
              <button
                onClick={() => loadStocks(selectedPortfolio.id)}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Refresh Holdings
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              NeuTrade Simulator  -- KicktheByte
            </h1>
            <p className="text-slate-400">Real-time market data & portfolio management powered by Neueda</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {portfolios.length > 0 && (
              <select
                value={selectedPortfolio?.id || ''}
                onChange={(e) => {
                  const portfolio = portfolios.find(p => p.id === parseInt(e.target.value));
                  setSelectedPortfolio(portfolio);
                }}
                className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Select Portfolio</option>
                {portfolios.map(portfolio => (
                  <option key={portfolio.id} value={portfolio.id}>
                    {portfolio.name} ({formatCurrency(portfolio.totalValue || portfolio.initialCash)})
                  </option>
                ))}
              </select>
            )}
            
            <button
              onClick={refreshData}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-slate-800/30 px-6 py-3 border-b border-slate-700">
        <div className="flex space-x-6 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'portfolios', label: 'Portfolios', icon: Wallet },
            { id: 'market', label: 'Market', icon: TrendingUp },
            { id: 'orders', label: 'Orders', icon: Target },
            { id: 'holdings', label: 'Holdings', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {/* Status Messages */}
        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-400 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="mr-2 flex-shrink-0" size={16} />
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-300 hover:text-red-200"
            >
              <Minus size={16} />
            </button>
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/50 border border-green-600 text-green-400 rounded-lg p-4 mb-6 flex items-center">
            <Target className="mr-2 flex-shrink-0" size={16} />
            <span>{success}</span>
            <button
              onClick={() => setSuccess('')}
              className="ml-auto text-green-300 hover:text-green-200"
            >
              <Minus size={16} />
            </button>
          </div>
        )}
        
        {/* Tab Content */}
        <>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'portfolios' && renderPortfolios()}
          {activeTab === 'market' && renderMarket()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'holdings' && renderStocks()}
        </>
      </div>
    </div>
  );
};

export default Dashboard;