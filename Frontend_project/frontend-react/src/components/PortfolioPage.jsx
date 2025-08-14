import React from 'react';
import PortfolioList from './portfolio/PortfolioList';
import CreatePortfolio from './portfolio/CreatePortfolio';

const PortfolioPage = ({ portfolios, selectedPortfolio, setSelectedPortfolio, onCreatePortfolio }) => {
  return (
    <div className="space-y-6">
      <PortfolioList
        portfolios={portfolios}
        selectedPortfolio={selectedPortfolio}
        setSelectedPortfolio={setSelectedPortfolio}
      />
      <CreatePortfolio onCreate={onCreatePortfolio} />
    </div>
  );
};

export default PortfolioPage;
