package com.KickTheBytePortfolio.UserPortfolio.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import com.KickTheBytePortfolio.UserPortfolio.repositories.StockRepository;
import com.KickTheBytePortfolio.UserPortfolio.models.Stock;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/sample")
public class samplecontroller {
    private final StockRepository stockRepository;

    public samplecontroller(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }   
    @GetMapping("/stocks")
    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }
    

}
