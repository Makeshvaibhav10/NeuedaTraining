import React from 'react';
import PortfolioList from '../components/portfolio/PortfolioList';
import CreatePortfolio from '../components/portfolio/CreatePortfolio';

const PortfoliosPage = ({
  portfolios,
  selectedPortfolio,
  setSelectedPortfolio,
  onCreatePortfolio
}) => {
  return (
    <div className="p-4 space-y-6">
      <PortfolioList
        portfolios={portfolios}
        selectedPortfolio={selectedPortfolio}
        setSelectedPortfolio={setSelectedPortfolio}
      />
      <CreatePortfolio onCreate={onCreatePortfolio} />
    </div>
  );
};

export default PortfoliosPage;
