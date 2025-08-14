import React from 'react';

const MarketPerformance = ({ transactions, marketData, priceHistory }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      <h2 className="text-lg font-bold mb-4 text-white">Market Performance</h2>
      <div className="space-y-2 text-slate-300">
        {transactions.length === 0 && <p>No transactions yet.</p>}
        {transactions.map((tx, idx) => (
          <div key={idx} className="border-b border-slate-700 pb-2">
            <p>{tx.symbol} — {tx.type} — Qty: {tx.quantity}</p>
            <p>Price: {tx.price} | Date: {tx.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketPerformance;
