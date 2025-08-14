package com.KickTheBytePortfolio.UserPortfolio.service;

import com.KickTheBytePortfolio.UserPortfolio.dto.StockResponse;
import com.KickTheBytePortfolio.UserPortfolio.models.Stock;
import com.KickTheBytePortfolio.UserPortfolio.repositories.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class StockService {

    @Autowired
    private StockRepository stockRepository;

    public List<StockResponse> getStocksByPortfolioId(Long portfolioId) {
        List<Stock> stocks = stockRepository.findByPortfolioIdAndQuantityGreaterThan(portfolioId, 0);
        return stocks.stream()
                .map(this::convertToStockResponse)
                .collect(Collectors.toList());
    }

    public List<StockResponse> getStocksByUserId(String userId) {
        List<Stock> stocks = stockRepository.findByUserId(userId);
        return stocks.stream()
                .filter(stock -> stock.getQuantity() > 0)
                .map(this::convertToStockResponse)
                .collect(Collectors.toList());
    }

    public Optional<StockResponse> getStockByPortfolioAndSymbol(Long portfolioId, String symbol) {
        Optional<Stock> stock = stockRepository.findByPortfolioIdAndSymbol(portfolioId, symbol);
        return stock.map(this::convertToStockResponse);
    }

    public StockResponse updateStockCurrentPrice(Long portfolioId, String symbol, BigDecimal currentPrice) {
        Stock stock = stockRepository.findByPortfolioIdAndSymbol(portfolioId, symbol)
                .orElseThrow(() -> new RuntimeException("Stock not found"));

        BigDecimal newCurrentValue = currentPrice.multiply(new BigDecimal(stock.getQuantity()));
        stock.setCurrentValue(newCurrentValue);
        stock = stockRepository.save(stock);

        StockResponse response = convertToStockResponse(stock);
        response.setCurrentPrice(currentPrice);

        // Calculate profit/loss
        BigDecimal totalCost = stock.getAveragePrice().multiply(new BigDecimal(stock.getQuantity()));
        BigDecimal profitLoss = newCurrentValue.subtract(totalCost);
        response.setProfitLoss(profitLoss);

        if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal profitLossPercent = profitLoss.divide(totalCost, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(new BigDecimal(100));
            response.setProfitLossPercent(profitLossPercent);
        }

        return response;
    }

    private StockResponse convertToStockResponse(Stock stock) {
        return new StockResponse(
                stock.getId(),
                stock.getSymbol(),
                stock.getCompanyName(),
                stock.getQuantity(),
                stock.getAveragePrice(),
                stock.getCurrentValue()
        );
    }
}