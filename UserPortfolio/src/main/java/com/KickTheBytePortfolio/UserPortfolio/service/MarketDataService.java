package com.KickTheBytePortfolio.UserPortfolio.service;

import com.KickTheBytePortfolio.UserPortfolio.dto.SymbolDetailsResponse;
import com.KickTheBytePortfolio.UserPortfolio.dto.StockPriceResponse;
import com.KickTheBytePortfolio.UserPortfolio.dto.StockStatsResponse;
import com.KickTheBytePortfolio.UserPortfolio.models.Stock;
import com.KickTheBytePortfolio.UserPortfolio.models.Stock_Prices;
import com.KickTheBytePortfolio.UserPortfolio.repositories.StockRepository;
import com.KickTheBytePortfolio.UserPortfolio.repositories.StockPricesRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MarketDataService {

    @Value("${market.data.base.url:https://marketdata.neueda.com}")
    private String baseUrl;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private StockPricesRepository stockPricesRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Fetch and return the list of all available symbols from the market data API
     */
    public List<SymbolDetailsResponse> getAllSymbols() {
        String url = baseUrl + "/API/StockFeed/GetSymbolList";

        ResponseEntity<List<SymbolDetailsResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<SymbolDetailsResponse>>() {}
        );

        return response.getBody();
    }

    /**
     * Fetch symbol details for a specific ticker
     */
    public SymbolDetailsResponse getSymbolDetails(String symbol) {
        String url = baseUrl + "/API/StockFeed/GetSymbolDetails/" + symbol;

        ResponseEntity<List<SymbolDetailsResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<SymbolDetailsResponse>>() {}
        );

        List<SymbolDetailsResponse> symbols = response.getBody();
        return (symbols != null && !symbols.isEmpty()) ? symbols.get(0) : null;
    }

    /**
     * Fetch current stock price for a symbol
     */
    public StockPriceResponse getCurrentPrice(String symbol) {
        String url = baseUrl + "/API/StockFeed/GetStockPricesForSymbol/" + symbol.toLowerCase();

        ResponseEntity<List<StockPriceResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<StockPriceResponse>>() {}
        );

        List<StockPriceResponse> prices = response.getBody();
        return (prices != null && !prices.isEmpty()) ? prices.get(0) : null;
    }

    /**
     * Fetch multiple recent prices for a symbol
     */
    public List<StockPriceResponse> getRecentPrices(String symbol, int count) {
        String url = baseUrl + "/API/StockFeed/GetStockPricesForSymbol/" + symbol.toLowerCase() + "?HowManyValues=" + count;

        ResponseEntity<List<StockPriceResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<StockPriceResponse>>() {}
        );

        return response.getBody();
    }

    /**
     * Fetch historical prices for a symbol at a specific time
     */
    public List<StockPriceResponse> getHistoricalPrices(String symbol, int count, String time) {
        String url = baseUrl + "/API/StockFeed/GetStockPricesForSymbol/" + symbol.toLowerCase() +
                "?HowManyValues=" + count + "&WhatTime=" + time;

        ResponseEntity<List<StockPriceResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<StockPriceResponse>>() {}
        );

        return response.getBody();
    }

    /**
     * Fetch OHLC stats for a symbol and period
     */
    public StockStatsResponse getStockStats(String symbol, int periodNumber) {
        String url = baseUrl + "/API/StockFeed/GetOpenCloseMinMaxForSymbolAndPeriodNumber/" + symbol.toLowerCase() +
                "?PeriodNumber=" + periodNumber;

        ResponseEntity<List<StockStatsResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<StockStatsResponse>>() {}
        );

        List<StockStatsResponse> stats = response.getBody();
        return (stats != null && !stats.isEmpty()) ? stats.get(0) : null;
    }

    /**
     * Get available symbols for trading (this replaces the initializeStocksFromMarketData method
     * since your Stock model requires a Portfolio)
     */
    public List<SymbolDetailsResponse> getAvailableSymbols() {
        try {
            return getAllSymbols();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch available symbols from market data", e);
        }
    }

    /**
     * Update current prices for stocks in portfolios (scheduled task)
     * This only updates stocks that are actually held in portfolios
     */
    @Scheduled(fixedRate = 30000) // Run every 30 seconds
    @Transactional
    public void updatePortfolioStockPrices() {
        try {
            // Get all unique symbols from stocks held in portfolios
            List<Stock> allPortfolioStocks = stockRepository.findAll();

            for (Stock stock : allPortfolioStocks) {
                if (stock.getQuantity() > 0) { // Only update stocks that are actually held
                    StockPriceResponse priceData = getCurrentPrice(stock.getSymbol());
                    if (priceData != null) {
                        // Update the current value based on new price
                        BigDecimal newCurrentValue = priceData.getPrice().multiply(new BigDecimal(stock.getQuantity()));
                        stock.setCurrentValue(newCurrentValue);
                        stock.setLastUpdated(LocalDateTime.now());
                        stockRepository.save(stock);
                    }
                }
            }
        } catch (Exception e) {
            // Log error but don't stop the scheduler
            System.err.println("Error updating portfolio stock prices: " + e.getMessage());
        }
    }

    /**
     * Store historical price data for a symbol
     * This creates a price record that can be referenced by portfolio stocks
     */
    @Transactional
    public void storeHistoricalPrices(String symbol, int periodNumber) {
        try {
            StockStatsResponse stats = getStockStats(symbol, periodNumber);

            if (stats != null) {
                // Find any stock with this symbol to get the Stock reference
                List<Stock> stocksWithSymbol = stockRepository.findBySymbol(symbol.toLowerCase());

                if (!stocksWithSymbol.isEmpty()) {
                    // Use the first stock found (they should all have the same symbol anyway)
                    Stock stock = stocksWithSymbol.get(0);

                    Stock_Prices priceRecord = new Stock_Prices();
                    priceRecord.setStock(stock);
                    priceRecord.setPriceDate(LocalDate.now()); // You might want to parse the actual date
                    priceRecord.setOpen(stats.getOpeningPrice());
                    priceRecord.setHigh(stats.getMaxPrice());
                    priceRecord.setLow(stats.getMinPrice());
                    priceRecord.setClose(stats.getClosingPrice());
                    priceRecord.setVolume(0L); // Volume not provided by this API

                    stockPricesRepository.save(priceRecord);
                } else {
                    System.out.println("No portfolio stocks found for symbol: " + symbol);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to store historical prices for " + symbol, e);
        }
    }

    /**
     * Get live price for order execution
     */
    public BigDecimal getLivePriceForOrder(String symbol) {
        StockPriceResponse priceData = getCurrentPrice(symbol.toLowerCase());
        return (priceData != null) ? priceData.getPrice() : BigDecimal.ZERO;
    }

    /**
     * Check if a symbol is available for trading
     */
    public boolean isSymbolAvailable(String symbol) {
        try {
            SymbolDetailsResponse details = getSymbolDetails(symbol);
            return details != null;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get company name for a symbol
     */
    public String getCompanyName(String symbol) {
        try {
            SymbolDetailsResponse details = getSymbolDetails(symbol);
            return (details != null) ? details.getCompanyName() : symbol.toUpperCase();
        } catch (Exception e) {
            return symbol.toUpperCase();
        }
    }
}