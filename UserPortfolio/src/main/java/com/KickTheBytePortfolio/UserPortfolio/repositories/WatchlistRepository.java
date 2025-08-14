package com.KickTheBytePortfolio.UserPortfolio.repositories;

import com.KickTheBytePortfolio.UserPortfolio.models.Watchlists;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlists, Long> {
    List<Watchlists> findByPortfolioId(Long portfolioId);
    Optional<Watchlists> findByPortfolioIdAndSymbol(Long portfolioId, String symbol);

    @Query("SELECT w FROM Watchlists w WHERE w.portfolio.userId = :userId ORDER BY w.addedDate DESC")
    List<Watchlists> findByUserIdOrderByAddedDateDesc(@Param("userId") String userId);

    @Query("SELECT w FROM Watchlists w WHERE w.portfolio.id = :portfolioId ORDER BY w.addedDate DESC")
    List<Watchlists> findByPortfolioIdOrderByAddedDateDesc(@Param("portfolioId") Long portfolioId);
}