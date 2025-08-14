package com.KickTheBytePortfolio.UserPortfolio.repositories;

import com.KickTheBytePortfolio.UserPortfolio.models.Analytics_Snapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface Analytics_SnapshotRepository extends JpaRepository<Analytics_Snapshot, Long> {
    List<Analytics_Snapshot> findByPortfolioId(Long portfolioId);

    @Query("SELECT a FROM Analytics_Snapshot a WHERE a.portfolio.id = :portfolioId ORDER BY a.snapshotDate DESC")
    List<Analytics_Snapshot> findByPortfolioIdOrderBySnapshotDateDesc(@Param("portfolioId") Long portfolioId);

    @Query("SELECT a FROM Analytics_Snapshot a WHERE a.portfolio.userId = :userId ORDER BY a.snapshotDate DESC")
    List<Analytics_Snapshot> findByUserIdOrderBySnapshotDateDesc(@Param("userId") String userId);

    @Query("SELECT a FROM Analytics_Snapshot a WHERE a.portfolio.id = :portfolioId AND a.snapshotDate BETWEEN :startDate AND :endDate ORDER BY a.snapshotDate")
    List<Analytics_Snapshot> findByPortfolioIdAndSnapshotDateBetween(
            @Param("portfolioId") Long portfolioId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT a FROM Analytics_Snapshot a WHERE a.portfolio.id = :portfolioId ORDER BY a.snapshotDate DESC LIMIT 1")
    Optional<Analytics_Snapshot> findLatestByPortfolioId(@Param("portfolioId") Long portfolioId);
}