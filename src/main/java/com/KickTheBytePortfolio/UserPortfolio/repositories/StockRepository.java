package com.KickTheBytePortfolio.UserPortfolio.repositories;

import com.KickTheBytePortfolio.UserPortfolio.models.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    // Existing methods
    List<Stock> findByPortfolioId(Long portfolioId);
    Optional<Stock> findByPortfolioIdAndSymbol(Long portfolioId, String symbol);
    List<Stock> findByPortfolioIdAndQuantityGreaterThan(Long portfolioId, Integer quantity);

    @Query("SELECT s FROM Stock s WHERE s.portfolio.userId = :userId")
    List<Stock> findByUserId(@Param("userId") String userId);

    @Query("SELECT SUM(s.currentValue) FROM Stock s WHERE s.portfolio.id = :portfolioId")
    Double getTotalStockValueByPortfolioId(@Param("portfolioId") Long portfolioId);

    // New methods needed for MarketDataService
    List<Stock> findBySymbol(String symbol);

    @Query("SELECT DISTINCT s.symbol FROM Stock s WHERE s.quantity > 0")
    List<String> findDistinctSymbolsWithQuantity();

    @Query("SELECT s FROM Stock s WHERE s.symbol = :symbol AND s.quantity > 0")
    List<Stock> findActiveStocksBySymbol(@Param("symbol") String symbol);
}