package com.KickTheBytePortfolio.UserPortfolio.dto;

import java.math.BigDecimal;

public class PerformanceMetrics {
    private BigDecimal dailyReturn;
    private BigDecimal weeklyReturn;
    private BigDecimal monthlyReturn;
    private BigDecimal bestPerformer;
    private BigDecimal worstPerformer;
    private String bestPerformerSymbol;
    private String worstPerformerSymbol;

    // Default constructor
    public PerformanceMetrics() {}

    // Parameterized constructor
    public PerformanceMetrics(BigDecimal dailyReturn, BigDecimal weeklyReturn, BigDecimal monthlyReturn,
                              BigDecimal bestPerformer, BigDecimal worstPerformer,
                              String bestPerformerSymbol, String worstPerformerSymbol) {
        this.dailyReturn = dailyReturn;
        this.weeklyReturn = weeklyReturn;
        this.monthlyReturn = monthlyReturn;
        this.bestPerformer = bestPerformer;
        this.worstPerformer = worstPerformer;
        this.bestPerformerSymbol = bestPerformerSymbol;
        this.worstPerformerSymbol = worstPerformerSymbol;
    }

    public BigDecimal getDailyReturn() {
        return dailyReturn;
    }

    public void setDailyReturn(BigDecimal dailyReturn) {
        this.dailyReturn = dailyReturn;
    }

    public BigDecimal getWeeklyReturn() {
        return weeklyReturn;
    }

    public void setWeeklyReturn(BigDecimal weeklyReturn) {
        this.weeklyReturn = weeklyReturn;
    }

    public BigDecimal getMonthlyReturn() {
        return monthlyReturn;
    }

    public void setMonthlyReturn(BigDecimal monthlyReturn) {
        this.monthlyReturn = monthlyReturn;
    }

    public BigDecimal getBestPerformer() {
        return bestPerformer;
    }

    public void setBestPerformer(BigDecimal bestPerformer) {
        this.bestPerformer = bestPerformer;
    }

    public BigDecimal getWorstPerformer() {
        return worstPerformer;
    }

    public void setWorstPerformer(BigDecimal worstPerformer) {
        this.worstPerformer = worstPerformer;
    }

    public String getBestPerformerSymbol() {
        return bestPerformerSymbol;
    }

    public void setBestPerformerSymbol(String bestPerformerSymbol) {
        this.bestPerformerSymbol = bestPerformerSymbol;
    }

    public String getWorstPerformerSymbol() {
        return worstPerformerSymbol;
    }

    public void setWorstPerformerSymbol(String worstPerformerSymbol) {
        this.worstPerformerSymbol = worstPerformerSymbol;
    }
}
