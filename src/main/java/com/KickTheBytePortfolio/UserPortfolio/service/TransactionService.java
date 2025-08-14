package com.KickTheBytePortfolio.UserPortfolio.service;

import com.KickTheBytePortfolio.UserPortfolio.models.Transactions;
import com.KickTheBytePortfolio.UserPortfolio.repositories.TransactionsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class TransactionService {

    @Autowired
    private TransactionsRepository transactionsRepository;

    public List<Transactions> getTransactionsByPortfolioId(Long portfolioId) {
        return transactionsRepository.findByPortfolioIdOrderByTransactionDateDesc(portfolioId);
    }

    public List<Transactions> getTransactionsByUserId(String userId) {
        return transactionsRepository.findByUserIdOrderByTransactionDateDesc(userId);
    }

    public List<Transactions> getTransactionsByPortfolioAndSymbol(Long portfolioId, String symbol) {
        return transactionsRepository.findByPortfolioIdAndSymbol(portfolioId, symbol);
    }

    public List<Transactions> getTransactionsBetweenDates(Long portfolioId, LocalDateTime startDate, LocalDateTime endDate) {
        return transactionsRepository.findByPortfolioIdAndTransactionDateBetween(portfolioId, startDate, endDate);
    }
}