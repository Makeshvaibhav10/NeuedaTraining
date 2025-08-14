package com.KickTheBytePortfolio.UserPortfolio.service;

import com.KickTheBytePortfolio.UserPortfolio.dto.PortfolioResponse;
import com.KickTheBytePortfolio.UserPortfolio.dto.StockResponse;
import com.KickTheBytePortfolio.UserPortfolio.models.*;
import com.KickTheBytePortfolio.UserPortfolio.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PortfolioService {

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private Analytics_SnapshotRepository analyticsSnapshotRepository;

    public List<PortfolioResponse> getAllPortfoliosByUserId(String userId) {
        List<Portfolio> portfolios = portfolioRepository.findByUserIdOrderByCreatedDateDesc(userId);
        return portfolios.stream()
                .map(this::convertToPortfolioResponse)
                .collect(Collectors.toList());
    }

    public Optional<PortfolioResponse> getPortfolioById(Long portfolioId) {
        Optional<Portfolio> portfolio = portfolioRepository.findById(portfolioId);
        return portfolio.map(this::convertToPortfolioResponse);
    }

    public PortfolioResponse createPortfolio(String userId, String portfolioName, BigDecimal initialCash) {
        // Check if portfolio name already exists for user
        Optional<Portfolio> existing = portfolioRepository.findByUserIdAndPortfolioName(userId, portfolioName);
        if (existing.isPresent()) {
            throw new RuntimeException("Portfolio with name '" + portfolioName + "' already exists");
        }

        Portfolio portfolio = new Portfolio(userId, portfolioName, initialCash);
        portfolio = portfolioRepository.save(portfolio);

        // Create wallet for portfolio - CORRECTED: Use portfolio object, not portfolio.getId()
        Wallet wallet = new Wallet(portfolio, initialCash);
        walletRepository.save(wallet);

        // Create initial analytics snapshot - CORRECTED: Use portfolio object, not portfolio.getId()
        Analytics_Snapshot snapshot = new Analytics_Snapshot(portfolio, initialCash, initialCash, BigDecimal.ZERO);
        analyticsSnapshotRepository.save(snapshot);

        return convertToPortfolioResponse(portfolio);
    }

    public PortfolioResponse updatePortfolio(Long portfolioId, String portfolioName) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found with id: " + portfolioId));

        portfolio.setPortfolioName(portfolioName);
        portfolio.setLastUpdated(LocalDateTime.now());
        portfolio = portfolioRepository.save(portfolio);

        return convertToPortfolioResponse(portfolio);
    }

    public void deletePortfolio(Long portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found with id: " + portfolioId));
        portfolioRepository.delete(portfolio);
    }

    public PortfolioResponse updatePortfolioValue(Long portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found with id: " + portfolioId));

        // Calculate total stock value
        Double stockValue = stockRepository.getTotalStockValueByPortfolioId(portfolioId);
        BigDecimal totalStockValue = stockValue != null ? BigDecimal.valueOf(stockValue) : BigDecimal.ZERO;

        // Update total value
        BigDecimal newTotalValue = portfolio.getCashBalance().add(totalStockValue);
        portfolio.setTotalValue(newTotalValue);
        portfolio.setLastUpdated(LocalDateTime.now());

        portfolio = portfolioRepository.save(portfolio);
        return convertToPortfolioResponse(portfolio);
    }

    private PortfolioResponse convertToPortfolioResponse(Portfolio portfolio) {
        PortfolioResponse response = new PortfolioResponse(
                portfolio.getId(),
                portfolio.getUserId(),
                portfolio.getPortfolioName(),
                portfolio.getTotalValue(),
                portfolio.getCashBalance(),
                portfolio.getCreatedDate(),
                portfolio.getLastUpdated()
        );

        // Get stocks for this portfolio
        List<Stock> stocks = stockRepository.findByPortfolioIdAndQuantityGreaterThan(portfolio.getId(), 0);
        List<StockResponse> stockResponses = stocks.stream()
                .map(this::convertToStockResponse)
                .collect(Collectors.toList());
        response.setStocks(stockResponses);

        // Calculate day change (simplified - would need historical data)
        response.setDayChange(BigDecimal.ZERO);
        response.setDayChangePercent(BigDecimal.ZERO);

        return response;
    }

    private StockResponse convertToStockResponse(Stock stock) {
        StockResponse response = new StockResponse(
                stock.getId(),
                stock.getSymbol(),
                stock.getCompanyName(),
                stock.getQuantity(),
                stock.getAveragePrice(),
                stock.getCurrentValue()
        );

        response.setLastUpdated(stock.getLastUpdated());
        return response;
    }
}