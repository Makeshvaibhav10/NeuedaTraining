package com.KickTheBytePortfolio.UserPortfolio.repositories;

import com.KickTheBytePortfolio.UserPortfolio.models.Order;
import com.KickTheBytePortfolio.UserPortfolio.models.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByPortfolioId(Long portfolioId);
    List<Order> findByPortfolioIdAndOrderStatus(Long portfolioId, OrderStatus orderStatus);
    List<Order> findByPortfolioIdAndSymbol(Long portfolioId, String symbol);

    @Query("SELECT o FROM Order o WHERE o.portfolio.id = :portfolioId ORDER BY o.createdDate DESC")
    List<Order> findByPortfolioIdOrderByCreatedDateDesc(@Param("portfolioId") Long portfolioId);

    @Query("SELECT o FROM Order o WHERE o.portfolio.userId = :userId ORDER BY o.createdDate DESC")
    List<Order> findByUserIdOrderByCreatedDateDesc(@Param("userId") String userId);
}
