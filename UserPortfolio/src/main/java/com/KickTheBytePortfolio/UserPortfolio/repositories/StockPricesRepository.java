package com.KickTheBytePortfolio.UserPortfolio.repositories;
import org.springframework.data.jpa.repository.JpaRepository;
import com.KickTheBytePortfolio.UserPortfolio.models.Stock_Prices;
public interface StockPricesRepository extends JpaRepository<Stock_Prices, Integer> {

}
