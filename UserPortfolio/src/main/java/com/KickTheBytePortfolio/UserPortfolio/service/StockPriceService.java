package com.KickTheBytePortfolio.UserPortfolio.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.Arrays;

@Service
public class StockPriceService {

    private static final String NEUEDA_BASE_URL = "https://marketdata.neueda.com/API";
    private static final String STOCK_FEED_URL = NEUEDA_BASE_URL + "/StockFeed";
    private static final String PSEUDO_FEED_URL = NEUEDA_BASE_URL + "/PseudoFeed";

    private final RestTemplate restTemplate;

    public StockPriceService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Get current stock price from Neueda Market Data API
     * @param symbol Stock symbol (e.g., "cop", "cpgx")
     * @return Current stock price
     * @throws RuntimeException if unable to fetch price
     */
    public BigDecimal getCurrentPrice(String symbol) throws RuntimeException {
        try {
            // Try Simulated Market Data first
            return getCurrentPriceFromStockFeed(symbol);
        } catch (Exception e1) {
            try {
                // Fallback to PseudoFeed for simple testing
                return getCurrentPriceFromPseudoFeed(symbol);
            } catch (Exception e2) {
                throw new RuntimeException("Unable to fetch price for symbol: " + symbol +
                        ". StockFeed error: " + e1.getMessage() +
                        ", PseudoFeed error: " + e2.getMessage());
            }
        }
    }

    /**
     * Get current price from Neueda StockFeed (Simulated Market Data)
     */
    private BigDecimal getCurrentPriceFromStockFeed(String symbol) throws RuntimeException {
        try {
            String url = STOCK_FEED_URL + "/GetStockPricesForSymbol/" + symbol.toLowerCase();

            // The API returns an array, we want the first (latest) element
            StockPriceData[] response = restTemplate.getForObject(url, StockPriceData[].class);

            if (response != null && response.length > 0) {
                StockPriceData priceData = response[0];
                return new BigDecimal(String.valueOf(priceData.getPrice()));
            }

            throw new RuntimeException("No price data returned for symbol: " + symbol);

        } catch (RestClientException e) {
            throw new RuntimeException("Failed to fetch from StockFeed API for " + symbol + ": " + e.getMessage());
        }
    }

    /**
     * Get current price from Neueda PseudoFeed (Simple Testing Data)
     */
    private BigDecimal getCurrentPriceFromPseudoFeed(String symbol) throws RuntimeException {
        try {
            String url = PSEUDO_FEED_URL + "/" + symbol.toUpperCase();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey(symbol.toUpperCase())) {
                Map<String, Object> symbolData = (Map<String, Object>) response.get(symbol.toUpperCase());
                Object lastPrice = symbolData.get("last");

                if (lastPrice != null) {
                    return new BigDecimal(lastPrice.toString());
                }
            }

            throw new RuntimeException("No price data returned from PseudoFeed for symbol: " + symbol);

        } catch (RestClientException e) {
            throw new RuntimeException("Failed to fetch from PseudoFeed API for " + symbol + ": " + e.getMessage());
        }
    }

    /**
     * Get multiple stock prices in batch
     */
    public Map<String, BigDecimal> getCurrentPrices(String... symbols) {
        Map<String, BigDecimal> prices = new HashMap<>();

        for (String symbol : symbols) {
            try {
                prices.put(symbol, getCurrentPrice(symbol));
            } catch (Exception e) {
                System.err.println("Failed to get price for " + symbol + ": " + e.getMessage());
                // You could add a fallback mock price here if needed
                // prices.put(symbol, getMockPrice(symbol));
            }
        }

        return prices;
    }

    /**
     * Get historical prices for a symbol
     * @param symbol Stock symbol
     * @param numberOfValues Number of recent price points to retrieve
     * @return List of historical price data
     */
    public List<StockPriceData> getHistoricalPrices(String symbol, int numberOfValues) {
        try {
            String url = STOCK_FEED_URL + "/GetStockPricesForSymbol/" + symbol.toLowerCase() +
                    "?HowManyValues=" + numberOfValues;

            StockPriceData[] response = restTemplate.getForObject(url, StockPriceData[].class);

            if (response != null) {
                return Arrays.asList(response);
            }

            throw new RuntimeException("No historical data returned for symbol: " + symbol);

        } catch (RestClientException e) {
            throw new RuntimeException("Failed to fetch historical data for " + symbol + ": " + e.getMessage());
        }
    }

    /**
     * Get historical prices at a specific time
     */
    public List<StockPriceData> getHistoricalPricesAtTime(String symbol, int numberOfValues, String time) {
        try {
            String url = STOCK_FEED_URL + "/GetStockPricesForSymbol/" + symbol.toLowerCase() +
                    "?HowManyValues=" + numberOfValues + "&WhatTime=" + time;

            StockPriceData[] response = restTemplate.getForObject(url, StockPriceData[].class);

            if (response != null) {
                return Arrays.asList(response);
            }

            throw new RuntimeException("No historical data returned for symbol: " + symbol + " at time: " + time);

        } catch (RestClientException e) {
            throw new RuntimeException("Failed to fetch historical data for " + symbol + " at time " + time + ": " + e.getMessage());
        }
    }

    /**
     * Get OHLC (Open, High, Low, Close) data for a specific period
     */
    public OHLCData getOHLCData(String symbol, int periodNumber) {
        try {
            String url = STOCK_FEED_URL + "/GetOpenCloseMinMaxForSymbolAndPeriodNumber/" + symbol.toLowerCase() +
                    "?PeriodNumber=" + periodNumber;

            OHLCData[] response = restTemplate.getForObject(url, OHLCData[].class);

            if (response != null && response.length > 0) {
                return response[0];
            }

            throw new RuntimeException("No OHLC data returned for symbol: " + symbol + " period: " + periodNumber);

        } catch (RestClientException e) {
            throw new RuntimeException("Failed to fetch OHLC data for " + symbol + ": " + e.getMessage());
        }
    }

    /**
     * Get list of available symbols from the API
     */
    public List<SymbolInfo> getAvailableSymbols() {
        try {
            String url = STOCK_FEED_URL + "/GetSymbolList";

            SymbolInfo[] response = restTemplate.getForObject(url, SymbolInfo[].class);

            if (response != null) {
                return Arrays.asList(response);
            }

            throw new RuntimeException("No symbols returned from API");

        } catch (RestClientException e) {
            throw new RuntimeException("Failed to fetch symbol list: " + e.getMessage());
        }
    }

    /**
     * Get details for a specific symbol
     */
    public SymbolInfo getSymbolDetails(String symbol) {
        try {
            String url = STOCK_FEED_URL + "/GetSymbolDetails/" + symbol.toLowerCase();

            SymbolInfo[] response = restTemplate.getForObject(url, SymbolInfo[].class);

            if (response != null && response.length > 0) {
                return response[0];
            }

            throw new RuntimeException("No details returned for symbol: " + symbol);

        } catch (RestClientException e) {
            throw new RuntimeException("Failed to fetch symbol details for " + symbol + ": " + e.getMessage());
        }
    }

    /**
     * Check if the API is available
     */
    public boolean isApiAvailable() {
        try {
            getAvailableSymbols();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Fallback method with error handling
     */
    public BigDecimal getCurrentPriceWithFallback(String symbol) {
        try {
            return getCurrentPrice(symbol);
        } catch (Exception e) {
            System.err.println("Failed to get price for " + symbol + ": " + e.getMessage());
            throw e; // Re-throw the exception since we don't have a mock fallback
        }
    }

    // Inner classes for API response mapping
    public static class StockPriceData {
        private String companyName;
        private int periodNumber;
        private double price;
        private String symbol;
        private String timeStamp;

        // Getters and setters
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }

        public int getPeriodNumber() { return periodNumber; }
        public void setPeriodNumber(int periodNumber) { this.periodNumber = periodNumber; }

        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }

        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }

        public String getTimeStamp() { return timeStamp; }
        public void setTimeStamp(String timeStamp) { this.timeStamp = timeStamp; }
    }

    public static class SymbolInfo {
        private String companyName;
        private String symbol;
        private int symbolID;

        // Getters and setters
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }

        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }

        public int getSymbolID() { return symbolID; }
        public void setSymbolID(int symbolID) { this.symbolID = symbolID; }
    }

    public static class OHLCData {
        private double closingPrice;
        private double maxPrice;
        private double minPrice;
        private double openingPrice;
        private String periodEndTime;
        private int periodNumber;
        private String periodStartTime;
        private String symbol;
        private int symbolID;

        // Getters and setters
        public double getClosingPrice() { return closingPrice; }
        public void setClosingPrice(double closingPrice) { this.closingPrice = closingPrice; }

        public double getMaxPrice() { return maxPrice; }
        public void setMaxPrice(double maxPrice) { this.maxPrice = maxPrice; }

        public double getMinPrice() { return minPrice; }
        public void setMinPrice(double minPrice) { this.minPrice = minPrice; }

        public double getOpeningPrice() { return openingPrice; }
        public void setOpeningPrice(double openingPrice) { this.openingPrice = openingPrice; }

        public String getPeriodEndTime() { return periodEndTime; }
        public void setPeriodEndTime(String periodEndTime) { this.periodEndTime = periodEndTime; }

        public int getPeriodNumber() { return periodNumber; }
        public void setPeriodNumber(int periodNumber) { this.periodNumber = periodNumber; }

        public String getPeriodStartTime() { return periodStartTime; }
        public void setPeriodStartTime(String periodStartTime) { this.periodStartTime = periodStartTime; }

        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }

        public int getSymbolID() { return symbolID; }
        public void setSymbolID(int symbolID) { this.symbolID = symbolID; }
    }
}