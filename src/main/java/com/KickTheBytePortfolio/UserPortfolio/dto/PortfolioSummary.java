package com.KickTheBytePortfolio.UserPortfolio.dto;

import java.math.BigDecimal;

public class PortfolioSummary {
    private BigDecimal totalValue;
    private BigDecimal totalInvestment;
    private BigDecimal totalPnL;
    private Double pnLPercentage;
    private Integer totalHoldings;

    // Default constructor
    public PortfolioSummary() {
    }

    // Parameterized constructor
    public PortfolioSummary(BigDecimal totalValue, BigDecimal totalInvestment,
                            BigDecimal totalPnL, Double pnLPercentage, Integer totalHoldings) {
        this.totalValue = totalValue;
        this.totalInvestment = totalInvestment;
        this.totalPnL = totalPnL;
        this.pnLPercentage = pnLPercentage;
        this.totalHoldings = totalHoldings;
    }

    // Getters and Setters
    public BigDecimal getTotalValue() {
        return totalValue;
    }

    public void setTotalValue(BigDecimal totalValue) {
        this.totalValue = totalValue;
    }

    public BigDecimal getTotalInvestment() {
        return totalInvestment;
    }

    public void setTotalInvestment(BigDecimal totalInvestment) {
        this.totalInvestment = totalInvestment;
    }

    public BigDecimal getTotalPnL() {
        return totalPnL;
    }

    public void setTotalPnL(BigDecimal totalPnL) {
        this.totalPnL = totalPnL;
    }

    public Double getPnLPercentage() {
        return pnLPercentage;
    }

    public void setPnLPercentage(Double pnLPercentage) {
        this.pnLPercentage = pnLPercentage;
    }

    public Integer getTotalHoldings() {
        return totalHoldings;
    }

    public void setTotalHoldings(Integer totalHoldings) {
        this.totalHoldings = totalHoldings;
    }

}