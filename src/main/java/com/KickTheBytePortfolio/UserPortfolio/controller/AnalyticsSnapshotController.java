package com.KickTheBytePortfolio.UserPortfolio.controller;

import com.KickTheBytePortfolio.UserPortfolio.dto.PerformanceMetrics;
import com.KickTheBytePortfolio.UserPortfolio.dto.PortfolioSummary;
import com.KickTheBytePortfolio.UserPortfolio.dto.ProfitLossData;
import com.KickTheBytePortfolio.UserPortfolio.models.Analytics_Snapshot;
import com.KickTheBytePortfolio.UserPortfolio.service.AnalyticsSnapshotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AnalyticsSnapshotController {

    @Autowired
    private AnalyticsSnapshotService analyticsSnapshotService;

    /**
     * Get all snapshots for a specific portfolio
     */
    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<List<Analytics_Snapshot>> getSnapshotsByPortfolioId(@PathVariable Long portfolioId) {
        List<Analytics_Snapshot> snapshots = analyticsSnapshotService.getSnapshotsByPortfolioId(portfolioId);
        return ResponseEntity.ok(snapshots);
    }

    /**
     * Get all snapshots for a specific user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Analytics_Snapshot>> getSnapshotsByUserId(@PathVariable String userId) {
        List<Analytics_Snapshot> snapshots = analyticsSnapshotService.getSnapshotsByUserId(userId);
        return ResponseEntity.ok(snapshots);
    }

    /**
     * Create a new snapshot for a portfolio with current market prices
     */
    @PostMapping("/portfolio/{portfolioId}/snapshot")
    public ResponseEntity<Analytics_Snapshot> createSnapshot(@PathVariable Long portfolioId) {
        try {
            Analytics_Snapshot snapshot = analyticsSnapshotService.createSnapshotWithCurrentPrices(portfolioId);
            return ResponseEntity.ok(snapshot);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get the latest snapshot for a portfolio
     */
    @GetMapping("/portfolio/{portfolioId}/latest")
    public ResponseEntity<Analytics_Snapshot> getLatestSnapshot(@PathVariable Long portfolioId) {
        Analytics_Snapshot snapshot = analyticsSnapshotService.getLatestSnapshot(portfolioId);
        if (snapshot != null) {
            return ResponseEntity.ok(snapshot);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get or create today's snapshot with current market prices
     */
    @GetMapping("/portfolio/{portfolioId}/today")
    public ResponseEntity<Analytics_Snapshot> getTodaysSnapshot(@PathVariable Long portfolioId) {
        try {
            Analytics_Snapshot snapshot = analyticsSnapshotService.getTodaysSnapshot(portfolioId);
            return ResponseEntity.ok(snapshot);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Force refresh snapshot with current market data
     */
    @PostMapping("/portfolio/{portfolioId}/refresh")
    public ResponseEntity<Analytics_Snapshot> refreshSnapshot(@PathVariable Long portfolioId) {
        try {
            Analytics_Snapshot snapshot = analyticsSnapshotService.refreshSnapshot(portfolioId);
            return ResponseEntity.ok(snapshot);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get snapshots between date range
     */
    @GetMapping("/portfolio/{portfolioId}/range")
    public ResponseEntity<List<Analytics_Snapshot>> getSnapshotsBetweenDates(
            @PathVariable Long portfolioId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Analytics_Snapshot> snapshots = analyticsSnapshotService.getSnapshotsBetweenDates(portfolioId, startDate, endDate);
        return ResponseEntity.ok(snapshots);
    }

    /**
     * Get performance metrics for a portfolio
     */
    @GetMapping("/portfolio/{portfolioId}/performance")
    public ResponseEntity<PerformanceMetrics> getPerformanceMetrics(@PathVariable Long portfolioId) {
        try {
            PerformanceMetrics metrics = analyticsSnapshotService.getPerformanceMetrics(portfolioId);
            return ResponseEntity.ok(metrics);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get portfolio summary with current values
     */
    @GetMapping("/portfolio/{portfolioId}/summary")
    public ResponseEntity<PortfolioSummary> getPortfolioSummary(@PathVariable Long portfolioId) {
        try {
            PortfolioSummary summary = analyticsSnapshotService.getPortfolioSummary(portfolioId);
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get profit/loss history for specified days
     */
    @GetMapping("/portfolio/{portfolioId}/pnl-history")
    public ResponseEntity<List<ProfitLossData>> getProfitLossHistory(
            @PathVariable Long portfolioId,
            @RequestParam(defaultValue = "30") int days) {
        try {
            List<ProfitLossData> pnlData = analyticsSnapshotService.getProfitLossHistory(portfolioId, days);
            return ResponseEntity.ok(pnlData);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}