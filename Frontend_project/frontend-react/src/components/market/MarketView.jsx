import React from 'react';
import SymbolCard from './SymbolCard';
import DebugPanel from './DebugPanel';

const MarketView = ({
  marketSymbols,
  marketData,
  priceHistory,
  onAddToWatchlist,
  watchlist
}) => {
  if (!marketSymbols || marketSymbols.length === 0) {
    return <p className="text-slate-300">No market symbols loaded.</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        {marketSymbols.map(sym => (
          <SymbolCard
            key={sym.Symbol}
            symbol={sym.Symbol}
            companyName={sym.CompanyName}
            marketData={marketData[sym.Symbol]}
            priceHistory={priceHistory[sym.Symbol]}
            isInWatchlist={watchlist.some(item => item.symbol === sym.Symbol)}
            onAdd={() => onAddToWatchlist(sym.Symbol, sym.CompanyName)}
          />
        ))}
      </div>
      <DebugPanel data={{ marketData, priceHistory }} />
    </div>
  );
};

export default MarketView;
