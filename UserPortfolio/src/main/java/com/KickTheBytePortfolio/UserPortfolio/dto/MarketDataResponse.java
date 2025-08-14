package com.KickTheBytePortfolio.UserPortfolio.dto;

import java.math.BigDecimal;

public class MarketDataResponse {
    private String companyName;
    private Integer periodNumber;
    private BigDecimal price;
    private String symbol;
    private String timeStamp;

    // Constructors
    public MarketDataResponse() {}

    public MarketDataResponse(String companyName, Integer periodNumber, BigDecimal price, String symbol, String timeStamp) {
        this.companyName = companyName;
        this.periodNumber = periodNumber;
        this.price = price;
        this.symbol = symbol;
        this.timeStamp = timeStamp;
    }

    // Getters and Setters
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public Integer getPeriodNumber() { return periodNumber; }
    public void setPeriodNumber(Integer periodNumber) { this.periodNumber = periodNumber; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getTimeStamp() { return timeStamp; }
    public void setTimeStamp(String timeStamp) { this.timeStamp = timeStamp; }
}