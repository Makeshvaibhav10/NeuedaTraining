package com.KickTheBytePortfolio.UserPortfolio.service;

import com.KickTheBytePortfolio.UserPortfolio.dto.PerformanceMetrics;
import com.KickTheBytePortfolio.UserPortfolio.dto.PortfolioSummary;
import com.KickTheBytePortfolio.UserPortfolio.dto.ProfitLossData;
import com.KickTheBytePortfolio.UserPortfolio.models.Analytics_Snapshot;
import com.KickTheBytePortfolio.UserPortfolio.models.Portfolio;
import com.KickTheBytePortfolio.UserPortfolio.models.Stock;
import com.KickTheBytePortfolio.UserPortfolio.repositories.Analytics_SnapshotRepository;
import com.KickTheBytePortfolio.UserPortfolio.repositories.PortfolioRepository;
import com.KickTheBytePortfolio.UserPortfolio.repositories.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AnalyticsSnapshotService {

    @Autowired
    private Analytics_SnapshotRepository analyticsSnapshotRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private StockPriceService stockPriceService;

    public List<Analytics_Snapshot> getSnapshotsByPortfolioId(Long portfolioId) {
        return analyticsSnapshotRepository.findByPortfolioIdOrderBySnapshotDateDesc(portfolioId);
    }

    public List<Analytics_Snapshot> getSnapshotsByUserId(String userId) {
        return analyticsSnapshotRepository.findByUserIdOrderBySnapshotDateDesc(userId);
    }

    public Analytics_Snapshot createSnapshot(Long portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        // Get all stocks in the portfolio
        List<Stock> stocks = stockRepository.findByPortfolioId(portfolioId);

        BigDecimal totalStockValue = BigDecimal.ZERO;
        BigDecimal totalInvestedAmount = BigDecimal.ZERO;

        // Update stock prices and calculate current values
        for (Stock stock : stocks) {
            try {
                // Fetch latest price from API using the StockPriceService
                BigDecimal latestPrice = stockPriceService.getCurrentPriceWithFallback(stock.getSymbol());

                // Update the stock's current price
                stock.updateCurrentPrice(latestPrice);
                stockRepository.save(stock); // Save updated price to database

                // Use the updated values for calculations
                BigDecimal stockValue = stock.getCurrentMarketValue();
                BigDecimal investedAmount = stock.getTotalInvestedAmount();

                totalStockValue = totalStockValue.add(stockValue);
                totalInvestedAmount = totalInvestedAmount.add(investedAmount);

            } catch (Exception e) {
                // If unable to get current price from API, use existing current price or average price
                System.err.println("Failed to get current price for " + stock.getSymbol() + ": " + e.getMessage());

                BigDecimal stockValue = stock.getCurrentMarketValue();
                if (stockValue.compareTo(BigDecimal.ZERO) == 0) {
                    // Fallback to average price if current price is not set
                    stockValue = stock.getTotalInvestedAmount();
                }

                totalStockValue = totalStockValue.add(stockValue);
                totalInvestedAmount = totalInvestedAmount.add(stock.getTotalInvestedAmount());
            }
        }

        BigDecimal totalValue = portfolio.getCashBalance().add(totalStockValue);
        BigDecimal totalProfitLoss = totalStockValue.subtract(totalInvestedAmount);

        Analytics_Snapshot snapshot = new Analytics_Snapshot(
                portfolio,
                totalValue,
                portfolio.getCashBalance(),
                totalStockValue
        );

        snapshot.setTotalProfitLoss(totalProfitLoss);

        // Calculate day change if previous snapshot exists
        Optional<Analytics_Snapshot> previousSnapshot = analyticsSnapshotRepository.findLatestByPortfolioId(portfolioId);
        if (previousSnapshot.isPresent()) {
            BigDecimal previousValue = previousSnapshot.get().getTotalValue();
            BigDecimal dayChange = totalValue.subtract(previousValue);
            snapshot.setDayChange(dayChange);

            if (previousValue.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal dayChangePercent = dayChange.divide(previousValue, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal(100));
                snapshot.setDayChangePercent(dayChangePercent);
            }
        }

        return analyticsSnapshotRepository.save(snapshot);
    }

    public Analytics_Snapshot createSnapshotWithCurrentPrices(Long portfolioId) {
        return createSnapshot(portfolioId);
    }

    public Analytics_Snapshot getLatestSnapshot(Long portfolioId) {
        return analyticsSnapshotRepository.findLatestByPortfolioId(portfolioId)
                .orElse(null);
    }

    public List<Analytics_Snapshot> getSnapshotsBetweenDates(Long portfolioId, LocalDateTime startDate, LocalDateTime endDate) {
        return analyticsSnapshotRepository.findByPortfolioIdAndSnapshotDateBetween(portfolioId, startDate, endDate);
    }

    public Analytics_Snapshot getTodaysSnapshot(Long portfolioId) {
        Optional<Analytics_Snapshot> latestSnapshot = analyticsSnapshotRepository.findLatestByPortfolioId(portfolioId);

        if (latestSnapshot.isPresent()) {
            LocalDateTime today = LocalDateTime.now();
            LocalDateTime snapshotDate = latestSnapshot.get().getSnapshotDate();

            if (snapshotDate.toLocalDate().equals(today.toLocalDate())) {
                return latestSnapshot.get();
            }
        }

        return createSnapshot(portfolioId);
    }

    public Analytics_Snapshot refreshSnapshot(Long portfolioId) {
        return createSnapshot(portfolioId);
    }

    // Enhanced methods using your existing DTOs
    public PerformanceMetrics getPerformanceMetrics(Long portfolioId) {
        List<Stock> stocks = stockRepository.findByPortfolioId(portfolioId);

        BigDecimal bestPerformer = BigDecimal.ZERO;
        BigDecimal worstPerformer = BigDecimal.ZERO;
        String bestPerformerSymbol = "";
        String worstPerformerSymbol = "";

        // Update stock prices first
        for (Stock stock : stocks) {
            try {
                // Try to get latest price and update stock
                BigDecimal latestPrice = stockPriceService.getCurrentPriceWithFallback(stock.getSymbol());
                stock.updateCurrentPrice(latestPrice);
                stockRepository.save(stock);
            } catch (Exception e) {
                System.err.println("Failed to update price for " + stock.getSymbol() + ": " + e.getMessage());
            }
        }

        // Now calculate performance metrics using updated prices
        for (Stock stock : stocks) {
            BigDecimal changePercent = stock.getProfitLossPercentage();

            if (changePercent.compareTo(bestPerformer) > 0) {
                bestPerformer = changePercent;
                bestPerformerSymbol = stock.getSymbol();
            }

            if (changePercent.compareTo(worstPerformer) < 0) {
                worstPerformer = changePercent;
                worstPerformerSymbol = stock.getSymbol();
            }
        }

        // Calculate returns based on snapshots
        BigDecimal dailyReturn = calculateReturn(portfolioId, 1);
        BigDecimal weeklyReturn = calculateReturn(portfolioId, 7);
        BigDecimal monthlyReturn = calculateReturn(portfolioId, 30);

        return new PerformanceMetrics(dailyReturn, weeklyReturn, monthlyReturn,
                bestPerformer, worstPerformer, bestPerformerSymbol, worstPerformerSymbol);
    }

    public PortfolioSummary getPortfolioSummary(Long portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        List<Stock> stocks = stockRepository.findByPortfolioId(portfolioId);

        BigDecimal totalValue = BigDecimal.ZERO;
        BigDecimal totalInvestment = BigDecimal.ZERO;

        // Update prices and calculate summary
        for (Stock stock : stocks) {
            try {
                // Try to get latest price
                BigDecimal latestPrice = stockPriceService.getCurrentPriceWithFallback(stock.getSymbol());
                stock.updateCurrentPrice(latestPrice);
                stockRepository.save(stock);
            } catch (Exception e) {
                // Continue with existing price
                System.err.println("Failed to update price for " + stock.getSymbol() + ": " + e.getMessage());
            }

            // Use the stock's built-in methods for calculations
            totalValue = totalValue.add(stock.getCurrentMarketValue());
            totalInvestment = totalInvestment.add(stock.getTotalInvestedAmount());
        }

        // Add cash balance to total value
        totalValue = totalValue.add(portfolio.getCashBalance());

        BigDecimal totalPnL = totalValue.subtract(totalInvestment).subtract(portfolio.getCashBalance());
        Double pnLPercentage = 0.0;

        if (totalInvestment.compareTo(BigDecimal.ZERO) > 0) {
            pnLPercentage = totalPnL.divide(totalInvestment, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100)).doubleValue();
        }

        return new PortfolioSummary(totalValue, totalInvestment, totalPnL,
                pnLPercentage, stocks.size());
    }

    public List<ProfitLossData> getProfitLossHistory(Long portfolioId, int days) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);

        List<Analytics_Snapshot> snapshots = analyticsSnapshotRepository
                .findByPortfolioIdAndSnapshotDateBetween(portfolioId, startDate, endDate);

        List<ProfitLossData> pnlData = new ArrayList<>();

        for (Analytics_Snapshot snapshot : snapshots) {
            BigDecimal pnl = snapshot.getTotalProfitLoss();
            pnlData.add(new ProfitLossData(
                    snapshot.getSnapshotDate().toLocalDate(),
                    snapshot.getTotalValue(),
                    pnl
            ));
        }

        return pnlData;
    }

    /**
     * Update all stock prices in a portfolio
     */
    public void updatePortfolioStockPrices(Long portfolioId) {
        List<Stock> stocks = stockRepository.findByPortfolioId(portfolioId);

        for (Stock stock : stocks) {
            try {
                BigDecimal latestPrice = stockPriceService.getCurrentPriceWithFallback(stock.getSymbol());
                stock.updateCurrentPrice(latestPrice);
                stockRepository.save(stock);
                System.out.println("Updated " + stock.getSymbol() + " price to $" + latestPrice);
            } catch (Exception e) {
                System.err.println("Failed to update price for " + stock.getSymbol() + ": " + e.getMessage());
            }
        }
    }

    /**
     * Batch update stock prices for better performance
     */
    public void batchUpdateStockPrices(Long portfolioId) {
        List<Stock> stocks = stockRepository.findByPortfolioId(portfolioId);

        if (stocks.isEmpty()) {
            return;
        }

        // Get all symbols
        String[] symbols = stocks.stream()
                .map(Stock::getSymbol)
                .toArray(String[]::new);

        try {
            // Try to get all prices in batch
            var prices = stockPriceService.getCurrentPrices(symbols);

            // Update each stock with its new price
            for (Stock stock : stocks) {
                BigDecimal newPrice = prices.get(stock.getSymbol());
                if (newPrice != null) {
                    stock.updateCurrentPrice(newPrice);
                    stockRepository.save(stock);
                }
            }
        } catch (Exception e) {
            System.err.println("Batch update failed, falling back to individual updates: " + e.getMessage());
            updatePortfolioStockPrices(portfolioId);
        }
    }

    private BigDecimal calculateReturn(Long portfolioId, int daysBack) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(daysBack);

        List<Analytics_Snapshot> snapshots = analyticsSnapshotRepository
                .findByPortfolioIdAndSnapshotDateBetween(portfolioId, startDate, endDate);

        if (snapshots.size() < 2) {
            return BigDecimal.ZERO;
        }

        Analytics_Snapshot oldest = snapshots.get(snapshots.size() - 1);
        Analytics_Snapshot newest = snapshots.get(0);

        if (oldest.getTotalValue().compareTo(BigDecimal.ZERO) > 0) {
            return newest.getTotalValue().subtract(oldest.getTotalValue())
                    .divide(oldest.getTotalValue(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100));
        }

        return BigDecimal.ZERO;
    }
}