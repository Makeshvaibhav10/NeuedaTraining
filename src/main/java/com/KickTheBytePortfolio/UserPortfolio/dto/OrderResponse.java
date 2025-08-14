package com.KickTheBytePortfolio.UserPortfolio.dto;

import com.KickTheBytePortfolio.UserPortfolio.models.OrderStatus;
import com.KickTheBytePortfolio.UserPortfolio.models.OrderType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderResponse {
    private Long id;
    private Long portfolioId;
    private String symbol;
    private OrderType orderType;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal totalAmount;  // Added this field
    private OrderStatus orderStatus;
    private String status;  // Added this field for frontend compatibility
    private LocalDateTime createdDate;
    private LocalDateTime executedDate;  // Added this field
    private String executedAt;  // Added this field for frontend compatibility

    public OrderResponse() {
        // Default constructor for Jackson
    }

    public OrderResponse(Long id, Long portfolioId, String symbol, OrderType orderType,
                         Integer quantity, BigDecimal price, BigDecimal totalAmount,
                         OrderStatus orderStatus, LocalDateTime createdDate, LocalDateTime executedDate) {
        this.id = id;
        this.portfolioId = portfolioId;
        this.symbol = symbol;
        this.orderType = orderType;
        this.quantity = quantity;
        this.price = price;
        this.totalAmount = totalAmount;
        this.orderStatus = orderStatus;
        this.status = orderStatus != null ? orderStatus.toString() : "UNKNOWN";
        this.createdDate = createdDate;
        this.executedDate = executedDate;
        this.executedAt = executedDate != null ? executedDate.toString() : null;
    }

    // Getters
    public Long getId() { return id; }
    public Long getPortfolioId() { return portfolioId; }
    public String getSymbol() { return symbol; }
    public OrderType getOrderType() { return orderType; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getPrice() { return price; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public OrderStatus getOrderStatus() { return orderStatus; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public LocalDateTime getExecutedDate() { return executedDate; }
    public String getExecutedAt() { return executedAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setPortfolioId(Long portfolioId) { this.portfolioId = portfolioId; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public void setOrderType(OrderType orderType) { this.orderType = orderType; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public void setOrderStatus(OrderStatus orderStatus) {
        this.orderStatus = orderStatus;
        this.status = orderStatus != null ? orderStatus.toString() : "UNKNOWN";
    }
    public void setStatus(String status) { this.status = status; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public void setExecutedDate(LocalDateTime executedDate) {
        this.executedDate = executedDate;
        this.executedAt = executedDate != null ? executedDate.toString() : null;
    }
    public void setExecutedAt(String executedAt) { this.executedAt = executedAt; }
}