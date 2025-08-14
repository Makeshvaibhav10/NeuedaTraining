import React from 'react';
import MarketView from '../components/market/MarketView';

const MarketPage = ({
  marketSymbols,
  marketData,
  priceHistory,
  onAddToWatchlist,
  watchlist
}) => {
  return (
    <div className="p-4">
      <MarketView
        marketSymbols={marketSymbols}
        marketData={marketData}
        priceHistory={priceHistory}
        onAddToWatchlist={onAddToWatchlist}
        watchlist={watchlist}
      />
    </div>
  );
};

export default MarketPage;
