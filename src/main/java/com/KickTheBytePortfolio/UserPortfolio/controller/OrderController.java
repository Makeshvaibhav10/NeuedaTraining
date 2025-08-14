package com.KickTheBytePortfolio.UserPortfolio.controller;

import com.KickTheBytePortfolio.UserPortfolio.dto.OrderRequest;
import com.KickTheBytePortfolio.UserPortfolio.dto.OrderResponse;
import com.KickTheBytePortfolio.UserPortfolio.models.Order;
import com.KickTheBytePortfolio.UserPortfolio.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByPortfolioId(@PathVariable Long portfolioId) {
        List<Order> orders = orderService.getAllOrdersByPortfolioId(portfolioId);
        List<OrderResponse> orderResponses = orders.stream().map(this::convertToOrderResponse).collect(Collectors.toList());
        return ResponseEntity.ok(orderResponses);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUserId(@PathVariable String userId) {
        List<Order> orders = orderService.getAllOrdersByUserId(userId);
        List<OrderResponse> orderResponses = orders.stream().map(this::convertToOrderResponse).collect(Collectors.toList());
        return ResponseEntity.ok(orderResponses);
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest) {
        try {
            Order order = orderService.createOrder(orderRequest);
            OrderResponse response = convertToOrderResponse(order);
            return ResponseEntity.ok(response);

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
            OrderResponse response = convertToOrderResponse(order);
            return ResponseEntity.ok(response);
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

    // Helper method to convert Order entity to OrderResponse DTO
    private OrderResponse convertToOrderResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getPortfolio().getId(),
                order.getSymbol(),
                order.getOrderType(),
                order.getQuantity(),
                order.getPrice(),
                order.getTotalAmount(),
                order.getOrderStatus(),
                order.getCreatedDate(),
                order.getExecutedDate()
        );
    }
}