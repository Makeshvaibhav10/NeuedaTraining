import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const PortfolioStats = ({
  portfolios,
  selectedPortfolio,
  setSelectedPortfolio,
  stocks,
  watchlist
}) => {
  const totalValue = stocks.reduce((sum, stock) => sum + (stock.value || 0), 0);
  const cashBalance = selectedPortfolio?.cashBalance || 0;

  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      <h2 className="text-lg font-bold mb-4 text-white">Portfolio Overview</h2>
      <select
        value={selectedPortfolio?.id || ''}
        onChange={(e) =>
          setSelectedPortfolio(portfolios.find(p => p.id === e.target.value))
        }
        className="bg-slate-900 text-white px-3 py-2 rounded mb-4 w-full"
      >
        {portfolios.map(portfolio => (
          <option key={portfolio.id} value={portfolio.id}>
            {portfolio.name}
          </option>
        ))}
      </select>
      <div className="text-slate-300">
        <p>Total Holdings Value: {formatCurrency(totalValue)}</p>
        <p>Cash Balance: {formatCurrency(cashBalance)}</p>
        <p>Watchlist Count: {watchlist.length}</p>
      </div>
    </div>
  );
};

export default PortfolioStats;
