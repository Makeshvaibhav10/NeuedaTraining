import React from 'react';
import PortfolioCard from './PortfolioCard';

const PortfolioList = ({ portfolios, selectedPortfolio, setSelectedPortfolio }) => {
  if (!portfolios || portfolios.length === 0) {
    return <p className="text-slate-300">No portfolios found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {portfolios.map(portfolio => (
        <PortfolioCard
          key={portfolio.id}
          portfolio={portfolio}
          isSelected={selectedPortfolio?.id === portfolio.id}
          onSelect={() => setSelectedPortfolio(portfolio)}
        />
      ))}
    </div>
  );
};

export default PortfolioList;
