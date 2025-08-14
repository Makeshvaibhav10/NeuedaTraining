package com.KickTheBytePortfolio.UserPortfolio.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AnalyticsResponse {
    private Long id;
    private Long portfolioId;
    private String userId;
    private LocalDateTime snapshotDate;
    private BigDecimal totalValue;
    private BigDecimal cashBalance;
    private BigDecimal stocksValue;
    private BigDecimal dayChange;
    private BigDecimal dayChangePercent;
    private BigDecimal totalProfitLoss;
    private PerformanceMetrics performanceMetrics;
    private List<StockPerformance> stockPerformances;

    // Constructors
    public AnalyticsResponse() {}

    public AnalyticsResponse(Long id, Long portfolioId, String userId, LocalDateTime snapshotDate,
                             BigDecimal totalValue, BigDecimal cashBalance, BigDecimal stocksValue,
                             BigDecimal dayChange, BigDecimal dayChangePercent, BigDecimal totalProfitLoss) {
        this.id = id;
        this.portfolioId = portfolioId;
        this.userId = userId;
        this.snapshotDate = snapshotDate;
        this.totalValue = totalValue;
        this.cashBalance = cashBalance;
        this.stocksValue = stocksValue;
        this.dayChange = dayChange;
        this.dayChangePercent = dayChangePercent;
        this.totalProfitLoss = totalProfitLoss;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPortfolioId() { return portfolioId; }
    public void setPortfolioId(Long portfolioId) { this.portfolioId = portfolioId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public LocalDateTime getSnapshotDate() { return snapshotDate; }
    public void setSnapshotDate(LocalDateTime snapshotDate) { this.snapshotDate = snapshotDate; }

    public BigDecimal getTotalValue() { return totalValue; }
    public void setTotalValue(BigDecimal totalValue) { this.totalValue = totalValue; }

    public BigDecimal getCashBalance() { return cashBalance; }
    public void setCashBalance(BigDecimal cashBalance) { this.cashBalance = cashBalance; }

    public BigDecimal getStocksValue() { return stocksValue; }
    public void setStocksValue(BigDecimal stocksValue) { this.stocksValue = stocksValue; }

    public BigDecimal getDayChange() { return dayChange; }
    public void setDayChange(BigDecimal dayChange) { this.dayChange = dayChange; }

    public BigDecimal getDayChangePercent() { return dayChangePercent; }
    public void setDayChangePercent(BigDecimal dayChangePercent) { this.dayChangePercent = dayChangePercent; }

    public BigDecimal getTotalProfitLoss() { return totalProfitLoss; }
    public void setTotalProfitLoss(BigDecimal totalProfitLoss) { this.totalProfitLoss = totalProfitLoss; }

    public PerformanceMetrics getPerformanceMetrics() { return performanceMetrics; }
    public void setPerformanceMetrics(PerformanceMetrics performanceMetrics) { this.performanceMetrics = performanceMetrics; }

    public List<StockPerformance> getStockPerformances() { return stockPerformances; }
    public void setStockPerformances(List<StockPerformance> stockPerformances) { this.stockPerformances = stockPerformances; }

    // Inner class for individual stock performance
    public static class StockPerformance {
        private String symbol;
        private String companyName;
        private Integer quantity;
        private BigDecimal purchasePrice;
        private BigDecimal currentPrice;
        private BigDecimal totalValue;
        private BigDecimal profitLoss;
        private BigDecimal profitLossPercent;

        // Constructors
        public StockPerformance() {}

        public StockPerformance(String symbol, String companyName, Integer quantity,
                                BigDecimal purchasePrice, BigDecimal currentPrice) {
            this.symbol = symbol;
            this.companyName = companyName;
            this.quantity = quantity;
            this.purchasePrice = purchasePrice;
            this.currentPrice = currentPrice;
            this.totalValue = currentPrice.multiply(BigDecimal.valueOf(quantity));

            BigDecimal investedAmount = purchasePrice.multiply(BigDecimal.valueOf(quantity));
            this.profitLoss = this.totalValue.subtract(investedAmount);

            if (investedAmount.compareTo(BigDecimal.ZERO) > 0) {
                this.profitLossPercent = this.profitLoss.divide(investedAmount, 4, BigDecimal.ROUND_HALF_UP)
                        .multiply(new BigDecimal(100));
            } else {
                this.profitLossPercent = BigDecimal.ZERO;
            }
        }

        // Getters and Setters
        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }

        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getPurchasePrice() { return purchasePrice; }
        public void setPurchasePrice(BigDecimal purchasePrice) { this.purchasePrice = purchasePrice; }

        public BigDecimal getCurrentPrice() { return currentPrice; }
        public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }

        public BigDecimal getTotalValue() { return totalValue; }
        public void setTotalValue(BigDecimal totalValue) { this.totalValue = totalValue; }

        public BigDecimal getProfitLoss() { return profitLoss; }
        public void setProfitLoss(BigDecimal profitLoss) { this.profitLoss = profitLoss; }

        public BigDecimal getProfitLossPercent() { return profitLossPercent; }
        public void setProfitLossPercent(BigDecimal profitLossPercent) { this.profitLossPercent = profitLossPercent; }
    }
}