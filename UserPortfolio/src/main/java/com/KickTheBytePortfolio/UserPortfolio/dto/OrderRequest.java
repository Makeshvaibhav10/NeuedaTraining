package com.KickTheBytePortfolio.UserPortfolio.dto;

import com.KickTheBytePortfolio.UserPortfolio.models.OrderType;
import java.math.BigDecimal;

public class OrderRequest {
    private Long portfolioId;
    private String symbol;
    private OrderType orderType;
    private Integer quantity;
    private BigDecimal price;

    // Constructors
    public OrderRequest() {}

    public OrderRequest(Long portfolioId, String symbol, OrderType orderType, Integer quantity, BigDecimal price) {
        this.portfolioId = portfolioId;
        this.symbol = symbol;
        this.orderType = orderType;
        this.quantity = quantity;
        this.price = price;
    }

    // Getters and Setters
    public Long getPortfolioId() { return portfolioId; }
    public void setPortfolioId(Long portfolioId) { this.portfolioId = portfolioId; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public OrderType getOrderType() { return orderType; }
    public void setOrderType(OrderType orderType) { this.orderType = orderType; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}