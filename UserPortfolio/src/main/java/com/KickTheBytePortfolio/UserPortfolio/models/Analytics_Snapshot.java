package com.KickTheBytePortfolio.UserPortfolio.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytics_snapshots")
public class Analytics_Snapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDateTime snapshotDate = LocalDateTime.now();

    @Column(name = "total_value", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalValue;

    @Column(name = "cash_balance", precision = 15, scale = 2, nullable = false)
    private BigDecimal cashBalance;

    @Column(name = "stocks_value", precision = 15, scale = 2, nullable = false)
    private BigDecimal stocksValue;

    @Column(name = "day_change", precision = 15, scale = 2)
    private BigDecimal dayChange = BigDecimal.ZERO;

    @Column(name = "day_change_percent", precision = 5, scale = 2)
    private BigDecimal dayChangePercent = BigDecimal.ZERO;

    @Column(name = "total_profit_loss", precision = 15, scale = 2)
    private BigDecimal totalProfitLoss = BigDecimal.ZERO;

    // Constructors
    public Analytics_Snapshot() {}

    public Analytics_Snapshot(Portfolio portfolio, BigDecimal totalValue, BigDecimal cashBalance, BigDecimal stocksValue) {
        this.portfolio = portfolio;
        this.totalValue = totalValue;
        this.cashBalance = cashBalance;
        this.stocksValue = stocksValue;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Portfolio getPortfolio() { return portfolio; }
    public void setPortfolio(Portfolio portfolio) { this.portfolio = portfolio; }

    public LocalDateTime getSnapshotDate() { return snapshotDate; }
    public void setSnapshotDate(LocalDateTime snapshotDate) { this.snapshotDate = snapshotDate; }

    public BigDecimal getTotalValue() { return totalValue; }
    public void setTotalValue(BigDecimal totalValue) { this.totalValue = totalValue; }

    public BigDecimal getCashBalance() { return cashBalance; }
    public void setCashBalance(BigDecimal cashBalance) { this.cashBalance = cashBalance; }

    public BigDecimal getStocksValue() { return stocksValue; }
    public void setStocksValue(BigDecimal stocksValue) { this.stocksValue = stocksValue; }

    public BigDecimal getDayChange() { return dayChange; }
    public void setDayChange(BigDecimal dayChange) { this.dayChange = dayChange; }

    public BigDecimal getDayChangePercent() { return dayChangePercent; }
    public void setDayChangePercent(BigDecimal dayChangePercent) { this.dayChangePercent = dayChangePercent; }

    public BigDecimal getTotalProfitLoss() { return totalProfitLoss; }
    public void setTotalProfitLoss(BigDecimal totalProfitLoss) { this.totalProfitLoss = totalProfitLoss; }
}