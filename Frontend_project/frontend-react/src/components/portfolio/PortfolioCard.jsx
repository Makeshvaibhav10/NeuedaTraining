import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const PortfolioCard = ({ portfolio, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border cursor-pointer transition ${
        isSelected ? 'border-indigo-500 bg-slate-700' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
      }`}
    >
      <h3 className="text-lg font-bold text-white">{portfolio.name}</h3>
      <p className="text-slate-300">Cash Balance: {formatCurrency(portfolio.cashBalance)}</p>
      <p className="text-slate-300">Holdings: {portfolio.holdingsCount || 0}</p>
    </div>
  );
};

export default PortfolioCard;
