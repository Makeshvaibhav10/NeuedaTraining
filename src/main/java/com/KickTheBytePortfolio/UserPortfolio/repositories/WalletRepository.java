package com.KickTheBytePortfolio.UserPortfolio.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.KickTheBytePortfolio.UserPortfolio.models.Wallet;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    // Removed unused findByUserId method - WalletService only uses findByPortfolioId

    // Add the missing method used in OrderService
    @Query("SELECT w FROM Wallet w WHERE w.portfolio.id = :portfolioId")
    Optional<Wallet> findByPortfolioId(@Param("portfolioId") Long portfolioId);

    // Custom update query for updating balance and timestamp - FIXED: changed updatedAt to lastUpdated
    @Modifying
    @Query("UPDATE Wallet w SET w.balance = :newBalance, w.lastUpdated = :updatedAt WHERE w.portfolio.id = :portfolioId")
    void updateBalanceByPortfolioId(@Param("portfolioId") Long portfolioId,
                                    @Param("newBalance") BigDecimal newBalance,
                                    @Param("updatedAt") LocalDateTime updatedAt);

    // FIXED: changed updatedAt to lastUpdated
    @Modifying
    @Query("UPDATE Wallet w SET w.balance = :newBalance, w.lastUpdated = :updatedAt WHERE w.id = :walletId")
    void updateBalance(@Param("walletId") Long walletId,
                       @Param("newBalance") BigDecimal newBalance,
                       @Param("updatedAt") LocalDateTime updatedAt);
}