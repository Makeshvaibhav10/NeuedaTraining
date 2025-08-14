package com.KickTheBytePortfolio.UserPortfolio.controller;

import com.KickTheBytePortfolio.UserPortfolio.dto.OrderRequest;
import com.KickTheBytePortfolio.UserPortfolio.models.Order;
import com.KickTheBytePortfolio.UserPortfolio.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<List<Order>> getOrdersByPortfolioId(@PathVariable Long portfolioId) {
        List<Order> orders = orderService.getAllOrdersByPortfolioId(portfolioId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable String userId) {
        List<Order> orders = orderService.getAllOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest) {
        try {
            Order order = orderService.createOrder(orderRequest);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            System.err.println("Order creation failed: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{orderId}/execute")
    public ResponseEntity<?> executeOrder(@PathVariable Long orderId) {
        try {
            System.out.println("Attempting to execute order with ID: " + orderId);
            Order order = orderService.executeOrder(orderId);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            System.err.println("Order execution failed for order ID " + orderId + ": " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("orderId", String.valueOf(orderId));
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        try {
            orderService.cancelOrder(orderId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            System.err.println("Order cancellation failed: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}