package com.KickTheBytePortfolio.UserPortfolio.controller;

import com.KickTheBytePortfolio.UserPortfolio.dto.PortfolioResponse;
import com.KickTheBytePortfolio.UserPortfolio.service.PortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/portfolios")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PortfolioController {

    @Autowired
    private PortfolioService portfolioService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PortfolioResponse>> getPortfoliosByUserId(@PathVariable String userId) {
        List<PortfolioResponse> portfolios = portfolioService.getAllPortfoliosByUserId(userId);
        return ResponseEntity.ok(portfolios);
    }

    @GetMapping("/{portfolioId}")
    public ResponseEntity<PortfolioResponse> getPortfolioById(@PathVariable Long portfolioId) {
        Optional<PortfolioResponse> portfolio = portfolioService.getPortfolioById(portfolioId);
        return portfolio.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PortfolioResponse> createPortfolio(
            @RequestParam String userId,
            @RequestParam String portfolioName,
            @RequestParam BigDecimal initialCash) {
        try {
            PortfolioResponse portfolio = portfolioService.createPortfolio(userId, portfolioName, initialCash);
            return ResponseEntity.ok(portfolio);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{portfolioId}")
    public ResponseEntity<PortfolioResponse> updatePortfolio(
            @PathVariable Long portfolioId,
            @RequestParam String portfolioName) {
        try {
            PortfolioResponse portfolio = portfolioService.updatePortfolio(portfolioId, portfolioName);
            return ResponseEntity.ok(portfolio);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{portfolioId}")
    public ResponseEntity<Void> deletePortfolio(@PathVariable Long portfolioId) {
        try {
            portfolioService.deletePortfolio(portfolioId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{portfolioId}/update-value")
    public ResponseEntity<PortfolioResponse> updatePortfolioValue(@PathVariable Long portfolioId) {
        try {
            PortfolioResponse portfolio = portfolioService.updatePortfolioValue(portfolioId);
            return ResponseEntity.ok(portfolio);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}