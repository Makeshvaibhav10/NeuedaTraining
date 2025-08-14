import React from 'react';

const SymbolCard = ({
  symbol,
  companyName,
  marketData,
  priceHistory,
  isInWatchlist,
  onAdd
}) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      <h3 className="text-lg font-bold text-white">{symbol}</h3>
      <p className="text-slate-300">{companyName}</p>
      <p className="text-slate-300">
        Price: {marketData?.price || 'N/A'} | Time: {marketData?.timeStamp || 'N/A'}
      </p>
      {priceHistory && priceHistory.length > 0 && (
        <p className="text-slate-400 text-sm">
          Latest Historical Price: {priceHistory[0].price}
        </p>
      )}
      {!isInWatchlist && (
        <button
          onClick={onAdd}
          className="mt-3 bg-indigo-600 text-white px-4 py-1 rounded"
        >
          Add to Watchlist
        </button>
      )}
    </div>
  );
};

export default SymbolCard;
