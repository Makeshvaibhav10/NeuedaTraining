package com.KickTheBytePortfolio.UserPortfolio.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "watchlists")
public class Watchlists {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "symbol", nullable = false)
    private String symbol;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "added_date")
    private LocalDateTime addedDate = LocalDateTime.now();

    // Constructors
    public Watchlists() {}

    public Watchlists(Portfolio portfolio, String symbol, String companyName) {
        this.portfolio = portfolio;
        this.symbol = symbol;
        this.companyName = companyName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Portfolio getPortfolio() { return portfolio; }
    public void setPortfolio(Portfolio portfolio) { this.portfolio = portfolio; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public LocalDateTime getAddedDate() { return addedDate; }
    public void setAddedDate(LocalDateTime addedDate) { this.addedDate = addedDate; }
}
