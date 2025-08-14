package com.KickTheBytePortfolio.UserPortfolio.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Entity
@Table(name = "stocks")
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "symbol", nullable = false)
    private String symbol;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "average_price", precision = 19, scale = 2)
    private BigDecimal averagePrice;

    @Column(name = "current_price", precision = 19, scale = 2)
    private BigDecimal currentPrice;

    @Column(name = "current_value", precision = 19, scale = 2)
    private BigDecimal currentValue;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    // Default constructor
    public Stock() {
        this.lastUpdated = LocalDateTime.now();
    }

    // Constructor with id, symbol, and companyName (existing)
    public Stock(Long id, String symbol, String companyName) {
        this.id = id;
        this.symbol = symbol;
        this.companyName = companyName;
        this.lastUpdated = LocalDateTime.now();
    }

    // Constructor for creating new stock holdings
    public Stock(Portfolio portfolio, String symbol, String companyName, Integer quantity, BigDecimal averagePrice) {
        this.portfolio = portfolio;
        this.symbol = symbol;
        this.companyName = companyName;
        this.quantity = quantity;
        this.averagePrice = averagePrice;
        this.currentPrice = averagePrice; // Initially set current price to average price
        this.currentValue = averagePrice.multiply(new BigDecimal(quantity));
        this.lastUpdated = LocalDateTime.now();
    }

    // Constructor with all essential fields
    public Stock(Portfolio portfolio, String symbol, String companyName, Integer quantity,
                 BigDecimal averagePrice, BigDecimal currentPrice) {
        this.portfolio = portfolio;
        this.symbol = symbol;
        this.companyName = companyName;
        this.quantity = quantity;
        this.averagePrice = averagePrice;
        this.currentPrice = currentPrice;
        this.currentValue = currentPrice.multiply(new BigDecimal(quantity));
        this.lastUpdated = LocalDateTime.now();
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Portfolio getPortfolio() {
        return portfolio;
    }

    public String getSymbol() {
        return symbol;
    }

    public String getCompanyName() {
        return companyName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getAveragePrice() {
        return averagePrice;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public BigDecimal getCurrentValue() {
        return currentValue;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setPortfolio(Portfolio portfolio) {
        this.portfolio = portfolio;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        // Recalculate current value when quantity changes
        if (this.currentPrice != null) {
            this.currentValue = this.currentPrice.multiply(new BigDecimal(quantity));
        }
    }

    public void setAveragePrice(BigDecimal averagePrice) {
        this.averagePrice = averagePrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
        // Automatically update current value when current price changes
        if (this.quantity != null && currentPrice != null) {
            this.currentValue = currentPrice.multiply(new BigDecimal(this.quantity));
        }
        this.lastUpdated = LocalDateTime.now();
    }

    public void setCurrentValue(BigDecimal currentValue) {
        this.currentValue = currentValue;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    // Business logic methods for analytics

    /**
     * Get total invested amount (average price × quantity)
     */
    public BigDecimal getTotalInvestedAmount() {
        if (averagePrice != null && quantity != null) {
            return averagePrice.multiply(BigDecimal.valueOf(quantity));
        }
        return BigDecimal.ZERO;
    }

    /**
     * Get current market value (current price × quantity)
     */
    public BigDecimal getCurrentMarketValue() {
        if (currentPrice != null && quantity != null) {
            return currentPrice.multiply(BigDecimal.valueOf(quantity));
        }
        return currentValue != null ? currentValue : BigDecimal.ZERO;
    }

    /**
     * Calculate profit/loss amount
     */
    public BigDecimal getProfitLoss() {
        BigDecimal currentMarketValue = getCurrentMarketValue();
        BigDecimal investedAmount = getTotalInvestedAmount();
        return currentMarketValue.subtract(investedAmount);
    }

    /**
     * Calculate profit/loss percentage
     */
    public BigDecimal getProfitLossPercentage() {
        BigDecimal investedAmount = getTotalInvestedAmount();
        if (investedAmount.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal profitLoss = getProfitLoss();
            return profitLoss.divide(investedAmount, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100));
        }
        return BigDecimal.ZERO;
    }

    /**
     * Calculate price change from average price
     */
    public BigDecimal getPriceChange() {
        if (currentPrice != null && averagePrice != null) {
            return currentPrice.subtract(averagePrice);
        }
        return BigDecimal.ZERO;
    }

    /**
     * Calculate price change percentage from average price
     */
    public BigDecimal getPriceChangePercentage() {
        if (averagePrice != null && averagePrice.compareTo(BigDecimal.ZERO) > 0 && currentPrice != null) {
            BigDecimal change = getPriceChange();
            return change.divide(averagePrice, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100));
        }
        return BigDecimal.ZERO;
    }

    /**
     * Update current price and recalculate derived values
     */
    public void updateCurrentPrice(BigDecimal newCurrentPrice) {
        this.currentPrice = newCurrentPrice;
        if (this.quantity != null) {
            this.currentValue = newCurrentPrice.multiply(BigDecimal.valueOf(this.quantity));
        }
        this.lastUpdated = LocalDateTime.now();
    }

    /**
     * Update quantity and recalculate derived values
     */
    public void updateQuantity(Integer newQuantity) {
        this.quantity = newQuantity;
        if (this.currentPrice != null) {
            this.currentValue = this.currentPrice.multiply(BigDecimal.valueOf(newQuantity));
        }
        this.lastUpdated = LocalDateTime.now();
    }

    /**
     * Add to existing quantity (for additional purchases)
     */
    public void addQuantity(Integer additionalQuantity, BigDecimal newPurchasePrice) {
        if (this.quantity != null && this.averagePrice != null) {
            // Calculate new average price
            BigDecimal totalInvested = getTotalInvestedAmount();
            BigDecimal additionalInvestment = newPurchasePrice.multiply(BigDecimal.valueOf(additionalQuantity));

            this.quantity += additionalQuantity;
            this.averagePrice = totalInvested.add(additionalInvestment)
                    .divide(BigDecimal.valueOf(this.quantity), 4, RoundingMode.HALF_UP);

            // Update current value if current price is set
            if (this.currentPrice != null) {
                this.currentValue = this.currentPrice.multiply(BigDecimal.valueOf(this.quantity));
            }
        } else {
            this.quantity = additionalQuantity;
            this.averagePrice = newPurchasePrice;
            this.currentPrice = newPurchasePrice;
            this.currentValue = newPurchasePrice.multiply(BigDecimal.valueOf(additionalQuantity));
        }
        this.lastUpdated = LocalDateTime.now();
    }

    /**
     * Check if price data is stale (older than specified minutes)
     */
    public boolean isPriceStale(int minutesThreshold) {
        if (lastUpdated == null) return true;
        return lastUpdated.isBefore(LocalDateTime.now().minusMinutes(minutesThreshold));
    }

    /**
     * Get formatted display string for current price vs average price
     */
    public String getPriceDisplayString() {
        if (currentPrice != null && averagePrice != null) {
            BigDecimal changePercent = getPriceChangePercentage();
            String sign = changePercent.compareTo(BigDecimal.ZERO) >= 0 ? "+" : "";
            return String.format("$%.2f (%s%.2f%%)",
                    currentPrice.doubleValue(),
                    sign,
                    changePercent.doubleValue());
        } else if (averagePrice != null) {
            return String.format("$%.2f", averagePrice.doubleValue());
        }
        return "N/A";
    }

    @Override
    public String toString() {
        return "Stock{" +
                "id=" + id +
                ", symbol='" + symbol + '\'' +
                ", companyName='" + companyName + '\'' +
                ", quantity=" + quantity +
                ", averagePrice=" + averagePrice +
                ", currentPrice=" + currentPrice +
                ", currentValue=" + currentValue +
                ", lastUpdated=" + lastUpdated +
                '}';
    }
}