package com.KickTheBytePortfolio.UserPortfolio.repositories;

import com.KickTheBytePortfolio.UserPortfolio.models.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    List<Portfolio> findByUserId(String userId);
    Optional<Portfolio> findByUserIdAndPortfolioName(String userId, String portfolioName);

    @Query("SELECT p FROM Portfolio p WHERE p.userId = :userId ORDER BY p.createdDate DESC")
    List<Portfolio> findByUserIdOrderByCreatedDateDesc(@Param("userId") String userId);
}