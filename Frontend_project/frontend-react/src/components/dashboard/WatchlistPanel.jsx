import React from 'react';

const WatchlistPanel = ({ watchlist, marketData }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      <h2 className="text-lg font-bold mb-4 text-white">Watchlist</h2>
      <div className="space-y-2 text-slate-300">
        {watchlist.length === 0 && <p>No symbols in watchlist.</p>}
        {watchlist.map(item => (
          <div key={item.symbol} className="border-b border-slate-700 pb-2">
            <p>{item.symbol} — {item.companyName}</p>
            <p>
              Price: {marketData[item.symbol]?.price || 'N/A'} | 
              Time: {marketData[item.symbol]?.timeStamp || 'N/A'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchlistPanel;
