package com.KickTheBytePortfolio.UserPortfolio.repositories;

import com.KickTheBytePortfolio.UserPortfolio.models.Transactions;
import com.KickTheBytePortfolio.UserPortfolio.models.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionsRepository extends JpaRepository<Transactions, Long> {

    // Find by portfolio ID using relationship
    @Query("SELECT t FROM Transactions t WHERE t.portfolio.id = :portfolioId")
    List<Transactions> findByPortfolioId(@Param("portfolioId") Long portfolioId);

    // Find by portfolio ID and transaction type
    @Query("SELECT t FROM Transactions t WHERE t.portfolio.id = :portfolioId AND t.transactionType = :transactionType")
    List<Transactions> findByPortfolioIdAndTransactionType(@Param("portfolioId") Long portfolioId,
                                                           @Param("transactionType") TransactionType transactionType);

    // Find by portfolio ID and symbol
    @Query("SELECT t FROM Transactions t WHERE t.portfolio.id = :portfolioId AND t.symbol = :symbol")
    List<Transactions> findByPortfolioIdAndSymbol(@Param("portfolioId") Long portfolioId,
                                                  @Param("symbol") String symbol);

    // Find by portfolio ID ordered by transaction date desc
    @Query("SELECT t FROM Transactions t WHERE t.portfolio.id = :portfolioId ORDER BY t.transactionDate DESC")
    List<Transactions> findByPortfolioIdOrderByTransactionDateDesc(@Param("portfolioId") Long portfolioId);

    // Find by user ID ordered by transaction date desc
    @Query("SELECT t FROM Transactions t WHERE t.portfolio.userId = :userId ORDER BY t.transactionDate DESC")
    List<Transactions> findByUserIdOrderByTransactionDateDesc(@Param("userId") String userId);

    // Find by portfolio ID and date range
    @Query("SELECT t FROM Transactions t WHERE t.portfolio.id = :portfolioId AND t.transactionDate BETWEEN :startDate AND :endDate")
    List<Transactions> findByPortfolioIdAndTransactionDateBetween(
            @Param("portfolioId") Long portfolioId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Additional useful methods
    @Query("SELECT t FROM Transactions t WHERE t.portfolio.id = :portfolioId ORDER BY t.transactionDate ASC")
    List<Transactions> findByPortfolioIdOrderByTransactionDateAsc(@Param("portfolioId") Long portfolioId);

    @Query("SELECT t FROM Transactions t WHERE t.symbol = :symbol ORDER BY t.transactionDate DESC")
    List<Transactions> findBySymbolOrderByTransactionDateDesc(@Param("symbol") String symbol);
}