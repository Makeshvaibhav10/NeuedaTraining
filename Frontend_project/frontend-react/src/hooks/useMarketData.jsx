import { useState } from 'react';
import { fetchMarketSymbols, getSymbolPrice, getSymbolHistory } from '../services/marketService';

export const useMarketData = (showSuccess, showError) => {
  const [marketSymbols, setMarketSymbols] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [priceHistory, setPriceHistory] = useState({});
  const [loading, setLoading] = useState(false);

  const loadMarketSymbols = async () => {
    setLoading(true);
    try {
      const symbols = await fetchMarketSymbols();
      setMarketSymbols(symbols);
      showSuccess(`Loaded ${symbols.length} market symbols`);
    } catch (err) {
      showError(`Failed to load market symbols: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateMarketData = async (watchlist) => {
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

  return {
    marketSymbols,
    marketData,
    priceHistory,
    loading,
    loadMarketSymbols,
    updateMarketData
  };
};
