package com.KickTheBytePortfolio.UserPortfolio.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ProfitLossData {
    private LocalDate date;
    private BigDecimal value;
    private BigDecimal pnl;

    // Default constructor
    public ProfitLossData() {}

    // Parameterized constructor
    public ProfitLossData(LocalDate date, BigDecimal value, BigDecimal pnl) {
        this.date = date;
        this.value = value;
        this.pnl = pnl;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }

    public BigDecimal getPnl() {
        return pnl;
    }

    public void setPnl(BigDecimal pnl) {
        this.pnl = pnl;
    }
}
