import React from 'react';
import PortfolioStats from './PortfolioStats';
import MarketPerformance from './MarketPerformance';
import QuickTrade from './QuickTrade';
import WatchlistPanel from './WatchlistPanel';

const Dashboard = ({
  selectedPortfolio,
  portfolios,
  setSelectedPortfolio,
  stocks,
  transactions,
  watchlist,
  marketData,
  marketSymbols,
  priceHistory,
  onTradeSubmit
}) => {
  return (
    <div className="space-y-6">
      <PortfolioStats
        portfolios={portfolios}
        selectedPortfolio={selectedPortfolio}
        setSelectedPortfolio={setSelectedPortfolio}
        stocks={stocks}
        watchlist={watchlist}
      />
      <MarketPerformance
        transactions={transactions}
        marketData={marketData}
        priceHistory={priceHistory}
      />
      <QuickTrade
        selectedPortfolio={selectedPortfolio}
        marketSymbols={marketSymbols}
        onTradeSubmit={onTradeSubmit}
      />
      <WatchlistPanel
        watchlist={watchlist}
        marketData={marketData}
      />
    </div>
  );
};

export default Dashboard;
