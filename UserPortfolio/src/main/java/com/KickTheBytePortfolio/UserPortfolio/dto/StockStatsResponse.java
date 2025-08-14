package com.KickTheBytePortfolio.UserPortfolio.dto;

import java.math.BigDecimal;

public class StockStatsResponse {
    private BigDecimal closingPrice;
    private BigDecimal maxPrice;
    private BigDecimal minPrice;
    private BigDecimal openingPrice;
    private String periodEndTime;
    private Integer periodNumber;
    private String periodStartTime;
    private String symbol;
    private Integer symbolID;

    // Constructors
    public StockStatsResponse() {}

    // Getters and Setters
    public BigDecimal getClosingPrice() { return closingPrice; }
    public void setClosingPrice(BigDecimal closingPrice) { this.closingPrice = closingPrice; }

    public BigDecimal getMaxPrice() { return maxPrice; }
    public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }

    public BigDecimal getMinPrice() { return minPrice; }
    public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }

    public BigDecimal getOpeningPrice() { return openingPrice; }
    public void setOpeningPrice(BigDecimal openingPrice) { this.openingPrice = openingPrice; }

    public String getPeriodEndTime() { return periodEndTime; }
    public void setPeriodEndTime(String periodEndTime) { this.periodEndTime = periodEndTime; }

    public Integer getPeriodNumber() { return periodNumber; }
    public void setPeriodNumber(Integer periodNumber) { this.periodNumber = periodNumber; }

    public String getPeriodStartTime() { return periodStartTime; }
    public void setPeriodStartTime(String periodStartTime) { this.periodStartTime = periodStartTime; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public Integer getSymbolID() { return symbolID; }
    public void setSymbolID(Integer symbolID) { this.symbolID = symbolID; }
}