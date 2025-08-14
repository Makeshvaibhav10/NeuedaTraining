package com.KickTheBytePortfolio.UserPortfolio.controller;

import com.KickTheBytePortfolio.UserPortfolio.dto.SymbolDetailsResponse;
import com.KickTheBytePortfolio.UserPortfolio.dto.StockPriceResponse;
import com.KickTheBytePortfolio.UserPortfolio.dto.StockStatsResponse;
import com.KickTheBytePortfolio.UserPortfolio.service.MarketDataService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RestController
@RequestMapping("/api/market-data")
public class MarketDataController {

    @Autowired
    private MarketDataService marketDataService;

    /**
     * Get all available symbols from market data API
     */
    @GetMapping("/symbols")
    public ResponseEntity<List<SymbolDetailsResponse>> getAllSymbols() {
        try {
            List<SymbolDetailsResponse> symbols = marketDataService.getAllSymbols();
            return ResponseEntity.ok(symbols);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get details for a specific symbol
     */
    @GetMapping("/symbols/{symbol}")
    public ResponseEntity<SymbolDetailsResponse> getSymbolDetails(@PathVariable String symbol) {
        try {
            SymbolDetailsResponse symbolDetails = marketDataService.getSymbolDetails(symbol);
            if (symbolDetails != null) {
                return ResponseEntity.ok(symbolDetails);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get current price for a symbol
     */
    @GetMapping("/price/{symbol}")
    public ResponseEntity<StockPriceResponse> getCurrentPrice(@PathVariable String symbol) {
        try {
            StockPriceResponse price = marketDataService.getCurrentPrice(symbol);
            if (price != null) {
                return ResponseEntity.ok(price);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get recent prices for a symbol
     */
    @GetMapping("/price/{symbol}/recent")
    public ResponseEntity<List<StockPriceResponse>> getRecentPrices(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "10") int count) {
        try {
            List<StockPriceResponse> prices = marketDataService.getRecentPrices(symbol, count);
            return ResponseEntity.ok(prices);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get historical prices for a symbol at a specific time
     */
    @GetMapping("/price/{symbol}/historical")
    public ResponseEntity<List<StockPriceResponse>> getHistoricalPrices(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "10") int count,
            @RequestParam String time) {
        try {
            List<StockPriceResponse> prices = marketDataService.getHistoricalPrices(symbol, count, time);
            return ResponseEntity.ok(prices);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get OHLC stats for a symbol and period
     */
    @GetMapping("/stats/{symbol}")
    public ResponseEntity<StockStatsResponse> getStockStats(
            @PathVariable String symbol,
            @RequestParam int periodNumber) {
        try {
            StockStatsResponse stats = marketDataService.getStockStats(symbol, periodNumber);
            if (stats != null) {
                return ResponseEntity.ok(stats);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get available symbols for trading
     * (Replaces the old initialize-stocks endpoint)
     */
    @GetMapping("/available-symbols")
    public ResponseEntity<List<SymbolDetailsResponse>> getAvailableSymbols() {
        try {
            List<SymbolDetailsResponse> symbols = marketDataService.getAvailableSymbols();
            return ResponseEntity.ok(symbols);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(null);
        }
    }

    /**
     * Check if a symbol is available for trading
     */
    @GetMapping("/symbols/{symbol}/available")
    public ResponseEntity<Boolean> isSymbolAvailable(@PathVariable String symbol) {
        try {
            boolean available = marketDataService.isSymbolAvailable(symbol);
            return ResponseEntity.ok(available);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get company name for a symbol
     */
    @GetMapping("/symbols/{symbol}/company-name")
    public ResponseEntity<String> getCompanyName(@PathVariable String symbol) {
        try {
            String companyName = marketDataService.getCompanyName(symbol);
            return ResponseEntity.ok(companyName);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Manually trigger price update for portfolio stocks
     * (Note: This only updates stocks that are held in portfolios)
     */
    @PostMapping("/update-portfolio-prices")
    public ResponseEntity<String> updatePortfolioPrices() {
        try {
            marketDataService.updatePortfolioStockPrices();
            return ResponseEntity.ok("Portfolio stock prices updated successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Failed to update portfolio prices: " + e.getMessage());
        }
    }

    /**
     * Store historical price data for a stock
     */
    @PostMapping("/historical/{symbol}")
    public ResponseEntity<String> storeHistoricalPrices(
            @PathVariable String symbol,
            @RequestParam int periodNumber) {
        try {
            marketDataService.storeHistoricalPrices(symbol, periodNumber);
            return ResponseEntity.ok("Historical prices stored successfully for " + symbol);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Failed to store historical prices: " + e.getMessage());
        }
    }

    /**
     * Get live price for order execution
     */
    @GetMapping("/price/{symbol}/live")
    public ResponseEntity<String> getLivePriceForOrder(@PathVariable String symbol) {
        try {
            java.math.BigDecimal price = marketDataService.getLivePriceForOrder(symbol);
            return ResponseEntity.ok("Live price for " + symbol + ": " + price.toString());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Failed to get live price: " + e.getMessage());
        }
    }
}