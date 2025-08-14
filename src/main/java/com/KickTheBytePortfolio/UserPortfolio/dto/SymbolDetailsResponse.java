package com.KickTheBytePortfolio.UserPortfolio.dto;

public class SymbolDetailsResponse {
    private String companyName;
    private String symbol;
    private Integer symbolID;

    // Constructors
    public SymbolDetailsResponse() {}

    public SymbolDetailsResponse(String companyName, String symbol, Integer symbolID) {
        this.companyName = companyName;
        this.symbol = symbol;
        this.symbolID = symbolID;
    }

    // Getters and Setters
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public Integer getSymbolID() { return symbolID; }
    public void setSymbolID(Integer symbolID) { this.symbolID = symbolID; }
}
