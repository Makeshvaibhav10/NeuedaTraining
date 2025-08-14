package com.KickTheBytePortfolio.UserPortfolio.service;

import com.KickTheBytePortfolio.UserPortfolio.dto.OrderRequest;
import com.KickTheBytePortfolio.UserPortfolio.models.*;
import com.KickTheBytePortfolio.UserPortfolio.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private TransactionsRepository transactionsRepository;

    @Autowired
    private WalletRepository walletRepository;

    public List<Order> getAllOrdersByPortfolioId(Long portfolioId) {
        return orderRepository.findByPortfolioIdOrderByCreatedDateDesc(portfolioId);
    }

    public List<Order> getAllOrdersByUserId(String userId) {
        return orderRepository.findByUserIdOrderByCreatedDateDesc(userId);
    }

    public Order createOrder(OrderRequest orderRequest) {
        Portfolio portfolio = portfolioRepository.findById(orderRequest.getPortfolioId())
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        Order order = new Order(
                portfolio,
                orderRequest.getSymbol(),
                orderRequest.getOrderType(),
                orderRequest.getQuantity(),
                orderRequest.getPrice()
        );

        return orderRepository.save(order);
    }

    public Order executeOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Order is not in pending state");
        }

        Portfolio portfolio = order.getPortfolio();
        BigDecimal totalAmount = order.getTotalAmount();

        try {
            if (order.getOrderType() == OrderType.BUY) {
                executeBuyOrder(order, portfolio, totalAmount);
            } else {
                executeSellOrder(order, portfolio, totalAmount);
            }

            order.setOrderStatus(OrderStatus.EXECUTED);
            order.setExecutedDate(LocalDateTime.now());

            // Update portfolio value
            portfolio.setLastUpdated(LocalDateTime.now());
            portfolioRepository.save(portfolio);

        } catch (Exception e) {
            order.setOrderStatus(OrderStatus.FAILED);
            throw new RuntimeException("Failed to execute order: " + e.getMessage());
        }

        return orderRepository.save(order);
    }

    // Updated executeBuyOrder method
    private void executeBuyOrder(Order order, Portfolio portfolio, BigDecimal totalAmount) {
        // Check if portfolio has enough cash
        Wallet wallet = walletRepository.findByPortfolioId(portfolio.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if (wallet.getBalance().compareTo(totalAmount) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

        // Update wallet balance
        wallet.setBalance(wallet.getBalance().subtract(totalAmount));
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);

        // Update portfolio cash balance
        portfolio.setCashBalance(portfolio.getCashBalance().subtract(totalAmount));

        // Update stock holdings
        updateStockHoldings(portfolio, order.getSymbol(), order.getQuantity(), order.getPrice(), true);

        // Create transaction record - FIXED: Use Portfolio object instead of ID
        BigDecimal transactionTotal = order.getPrice().multiply(new BigDecimal(order.getQuantity()));
        Transactions transaction = new Transactions(
                portfolio,              // Pass Portfolio object directly
                order.getSymbol(),
                TransactionType.BUY,
                order.getQuantity(),
                order.getPrice(),
                transactionTotal
        );
        transactionsRepository.save(transaction);
    }

    // Updated executeSellOrder method
    private void executeSellOrder(Order order, Portfolio portfolio, BigDecimal totalAmount) {
        // Check if portfolio has enough stocks
        Optional<Stock> stockOpt = stockRepository.findByPortfolioIdAndSymbol(portfolio.getId(), order.getSymbol());
        if (!stockOpt.isPresent() || stockOpt.get().getQuantity() < order.getQuantity()) {
            throw new RuntimeException("Insufficient stock quantity");
        }

        // Update wallet balance
        Wallet wallet = walletRepository.findByPortfolioId(portfolio.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        wallet.setBalance(wallet.getBalance().add(totalAmount));
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);

        // Update portfolio cash balance
        portfolio.setCashBalance(portfolio.getCashBalance().add(totalAmount));

        // Update stock holdings
        updateStockHoldings(portfolio, order.getSymbol(), order.getQuantity(), order.getPrice(), false);

        // Create transaction record - FIXED: Use Portfolio object instead of ID
        BigDecimal transactionTotal = order.getPrice().multiply(new BigDecimal(order.getQuantity()));
        Transactions transaction = new Transactions(
                portfolio,              // Pass Portfolio object directly
                order.getSymbol(),
                TransactionType.SELL,
                order.getQuantity(),
                order.getPrice(),
                transactionTotal
        );
        transactionsRepository.save(transaction);
    }

    private void updateStockHoldings(Portfolio portfolio, String symbol, Integer quantity,
                                     BigDecimal price, boolean isBuy) {
        Optional<Stock> stockOpt = stockRepository.findByPortfolioIdAndSymbol(portfolio.getId(), symbol);

        if (isBuy) {
            if (stockOpt.isPresent()) {
                Stock stock = stockOpt.get();

                // Calculate new average price
                BigDecimal currentValue = stock.getAveragePrice().multiply(new BigDecimal(stock.getQuantity()));
                BigDecimal newValue = price.multiply(new BigDecimal(quantity));
                BigDecimal totalValue = currentValue.add(newValue);
                Integer totalQuantity = stock.getQuantity() + quantity;

                // Fixed deprecated method usage
                BigDecimal newAveragePrice = totalValue.divide(new BigDecimal(totalQuantity), 2, RoundingMode.HALF_UP);

                stock.setQuantity(totalQuantity);
                stock.setAveragePrice(newAveragePrice);
                stock.setCurrentValue(newAveragePrice.multiply(new BigDecimal(totalQuantity)));
                stock.setLastUpdated(LocalDateTime.now());
                stockRepository.save(stock);
            } else {
                // Create new stock holding
                Stock newStock = new Stock(portfolio, symbol, symbol.toUpperCase(), quantity, price);
                stockRepository.save(newStock);
            }
        } else {
            // Sell operation
            Stock stock = stockOpt.get();
            stock.setQuantity(stock.getQuantity() - quantity);
            stock.setCurrentValue(stock.getAveragePrice().multiply(new BigDecimal(stock.getQuantity())));
            stock.setLastUpdated(LocalDateTime.now());
            stockRepository.save(stock);
        }
    }

    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Cannot cancel order that is not pending");
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }
}