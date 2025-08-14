package com.KickTheBytePortfolio.UserPortfolio.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PortfolioResponse {
        private Long id;
        private String userId;
        private String portfolioName;
        private BigDecimal totalValue;
        private BigDecimal cashBalance;
        private LocalDateTime createdDate;
        private LocalDateTime lastUpdated;
        private List<StockResponse> stocks;
        private BigDecimal dayChange;
        private BigDecimal dayChangePercent;

        // Constructors
        public PortfolioResponse() {}

        public PortfolioResponse(Long id, String userId, String portfolioName, BigDecimal totalValue,
                                 BigDecimal cashBalance, LocalDateTime createdDate, LocalDateTime lastUpdated) {
                this.id = id;
                this.userId = userId;
                this.portfolioName = portfolioName;
                this.totalValue = totalValue;
                this.cashBalance = cashBalance;
                this.createdDate = createdDate;
                this.lastUpdated = lastUpdated;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getPortfolioName() { return portfolioName; }
        public void setPortfolioName(String portfolioName) { this.portfolioName = portfolioName; }

        public BigDecimal getTotalValue() { return totalValue; }
        public void setTotalValue(BigDecimal totalValue) { this.totalValue = totalValue; }

        public BigDecimal getCashBalance() { return cashBalance; }
        public void setCashBalance(BigDecimal cashBalance) { this.cashBalance = cashBalance; }

        public LocalDateTime getCreatedDate() { return createdDate; }
        public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

        public LocalDateTime getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

        public List<StockResponse> getStocks() { return stocks; }
        public void setStocks(List<StockResponse> stocks) { this.stocks = stocks; }

        public BigDecimal getDayChange() { return dayChange; }
        public void setDayChange(BigDecimal dayChange) { this.dayChange = dayChange; }

        public BigDecimal getDayChangePercent() { return dayChangePercent; }
        public void setDayChangePercent(BigDecimal dayChangePercent) { this.dayChangePercent = dayChangePercent; }
}
