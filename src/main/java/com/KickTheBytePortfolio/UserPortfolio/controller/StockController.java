package com.KickTheBytePortfolio.UserPortfolio.controller;

import com.KickTheBytePortfolio.UserPortfolio.dto.StockResponse;
import com.KickTheBytePortfolio.UserPortfolio.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class StockController {

    @Autowired
    private StockService stockService;

    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<List<StockResponse>> getStocksByPortfolioId(@PathVariable Long portfolioId) {
        List<StockResponse> stocks = stockService.getStocksByPortfolioId(portfolioId);
        return ResponseEntity.ok(stocks);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<StockResponse>> getStocksByUserId(@PathVariable String userId) {
        List<StockResponse> stocks = stockService.getStocksByUserId(userId);
        return ResponseEntity.ok(stocks);
    }

    @GetMapping("/portfolio/{portfolioId}/symbol/{symbol}")
    public ResponseEntity<StockResponse> getStockByPortfolioAndSymbol(
            @PathVariable Long portfolioId,
            @PathVariable String symbol) {
        Optional<StockResponse> stock = stockService.getStockByPortfolioAndSymbol(portfolioId, symbol);
        return stock.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/portfolio/{portfolioId}/symbol/{symbol}/price")
    public ResponseEntity<StockResponse> updateStockCurrentPrice(
            @PathVariable Long portfolioId,
            @PathVariable String symbol,
            @RequestParam BigDecimal currentPrice) {
        try {
            StockResponse stock = stockService.updateStockCurrentPrice(portfolioId, symbol, currentPrice);
            return ResponseEntity.ok(stock);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
