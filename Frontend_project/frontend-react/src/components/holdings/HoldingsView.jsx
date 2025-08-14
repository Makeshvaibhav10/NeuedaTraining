import React from 'react';
import HoldingCard from './HoldingCard';

const HoldingsView = ({ stocks }) => {
  if (!stocks || stocks.length === 0) {
    return <p className="text-slate-300">No holdings available.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stocks.map(stock => (
        <HoldingCard key={stock.symbol} stock={stock} />
      ))}
    </div>
  );
};

export default HoldingsView;
