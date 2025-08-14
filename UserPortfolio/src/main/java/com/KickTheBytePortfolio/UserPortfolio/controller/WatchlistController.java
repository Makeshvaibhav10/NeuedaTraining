package com.KickTheBytePortfolio.UserPortfolio.controller;

import com.KickTheBytePortfolio.UserPortfolio.models.Watchlists;
import com.KickTheBytePortfolio.UserPortfolio.service.WatchlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/watchlist")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class WatchlistController {

    @Autowired
    private WatchlistService watchlistService;

    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<List<Watchlists>> getWatchlistByPortfolioId(@PathVariable Long portfolioId) {
        List<Watchlists> watchlist = watchlistService.getWatchlistByPortfolioId(portfolioId);
        return ResponseEntity.ok(watchlist);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Watchlists>> getWatchlistByUserId(@PathVariable String userId) {
        List<Watchlists> watchlist = watchlistService.getWatchlistByUserId(userId);
        return ResponseEntity.ok(watchlist);
    }

    @PostMapping
    public ResponseEntity<Watchlists> addToWatchlist(
            @RequestParam Long portfolioId,
            @RequestParam String symbol,
            @RequestParam String companyName) {
        try {
            Watchlists watchlist = watchlistService.addToWatchlist(portfolioId, symbol, companyName);
            return ResponseEntity.ok(watchlist);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/portfolio/{portfolioId}/symbol/{symbol}")
    public ResponseEntity<Void> removeFromWatchlist(
            @PathVariable Long portfolioId,
            @PathVariable String symbol) {
        try {
            watchlistService.removeFromWatchlist(portfolioId, symbol);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{watchlistId}")
    public ResponseEntity<Void> removeFromWatchlistById(@PathVariable Long watchlistId) {
        try {
            watchlistService.removeFromWatchlistById(watchlistId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
