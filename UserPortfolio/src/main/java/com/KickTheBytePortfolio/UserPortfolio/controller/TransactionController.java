package com.KickTheBytePortfolio.UserPortfolio.controller;

import com.KickTheBytePortfolio.UserPortfolio.models.Transactions;
import com.KickTheBytePortfolio.UserPortfolio.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<List<Transactions>> getTransactionsByPortfolioId(@PathVariable Long portfolioId) {
        List<Transactions> transactions = transactionService.getTransactionsByPortfolioId(portfolioId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transactions>> getTransactionsByUserId(@PathVariable String userId) {
        List<Transactions> transactions = transactionService.getTransactionsByUserId(userId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/portfolio/{portfolioId}/symbol/{symbol}")
    public ResponseEntity<List<Transactions>> getTransactionsByPortfolioAndSymbol(
            @PathVariable Long portfolioId,
            @PathVariable String symbol) {
        List<Transactions> transactions = transactionService.getTransactionsByPortfolioAndSymbol(portfolioId, symbol);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/portfolio/{portfolioId}/range")
    public ResponseEntity<List<Transactions>> getTransactionsBetweenDates(
            @PathVariable Long portfolioId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Transactions> transactions = transactionService.getTransactionsBetweenDates(portfolioId, startDate, endDate);
        return ResponseEntity.ok(transactions);
    }
}