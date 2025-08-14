package com.KickTheBytePortfolio.UserPortfolio.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StockResponse {
    private Long id;
    private String symbol;
    private String companyName;
    private Integer quantity;
    private BigDecimal averagePrice;
    private BigDecimal currentValue;
    private BigDecimal currentPrice; // Real-time price from frontend
    private BigDecimal profitLoss;
    private BigDecimal profitLossPercent;
    private LocalDateTime lastUpdated;

    // Constructors
    public StockResponse() {}

    public StockResponse(Long id, String symbol, String companyName, Integer quantity,
                         BigDecimal averagePrice, BigDecimal currentValue) {
        this.id = id;
        this.symbol = symbol;
        this.companyName = companyName;
        this.quantity = quantity;
        this.averagePrice = averagePrice;
        this.currentValue = currentValue;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getAveragePrice() { return averagePrice; }
    public void setAveragePrice(BigDecimal averagePrice) { this.averagePrice = averagePrice; }

    public BigDecimal getCurrentValue() { return currentValue; }
    public void setCurrentValue(BigDecimal currentValue) { this.currentValue = currentValue; }

    public BigDecimal getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }

    public BigDecimal getProfitLoss() { return profitLoss; }
    public void setProfitLoss(BigDecimal profitLoss) { this.profitLoss = profitLoss; }

    public BigDecimal getProfitLossPercent() { return profitLossPercent; }
    public void setProfitLossPercent(BigDecimal profitLossPercent) { this.profitLossPercent = profitLossPercent; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
