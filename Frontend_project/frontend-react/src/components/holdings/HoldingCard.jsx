import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const HoldingCard = ({ stock }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      <h3 className="text-lg font-bold text-white">{stock.symbol}</h3>
      <p className="text-slate-300">Quantity: {stock.quantity}</p>
      <p className="text-slate-300">Avg Price: {formatCurrency(stock.averagePrice)}</p>
      <p className="text-slate-300">Value: {formatCurrency(stock.value)}</p>
    </div>
  );
};

export default HoldingCard;
