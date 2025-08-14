package com.KickTheBytePortfolio.UserPortfolio.service;

import com.KickTheBytePortfolio.UserPortfolio.models.Portfolio;
import com.KickTheBytePortfolio.UserPortfolio.models.Watchlists;
import com.KickTheBytePortfolio.UserPortfolio.repositories.PortfolioRepository;
import com.KickTheBytePortfolio.UserPortfolio.repositories.WatchlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class WatchlistService {

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    public List<Watchlists> getWatchlistByPortfolioId(Long portfolioId) {
        return watchlistRepository.findByPortfolioIdOrderByAddedDateDesc(portfolioId);
    }

    public List<Watchlists> getWatchlistByUserId(String userId) {
        return watchlistRepository.findByUserIdOrderByAddedDateDesc(userId);
    }

    public Watchlists addToWatchlist(Long portfolioId, String symbol, String companyName) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        // Check if symbol already exists in watchlist
        Optional<Watchlists> existing = watchlistRepository.findByPortfolioIdAndSymbol(portfolioId, symbol);
        if (existing.isPresent()) {
            throw new RuntimeException("Symbol already exists in watchlist");
        }

        Watchlists watchlist = new Watchlists(portfolio, symbol, companyName);
        return watchlistRepository.save(watchlist);
    }

    public void removeFromWatchlist(Long portfolioId, String symbol) {
        Watchlists watchlist = watchlistRepository.findByPortfolioIdAndSymbol(portfolioId, symbol)
                .orElseThrow(() -> new RuntimeException("Symbol not found in watchlist"));
        watchlistRepository.delete(watchlist);
    }

    public void removeFromWatchlistById(Long watchlistId) {
        Watchlists watchlist = watchlistRepository.findById(watchlistId)
                .orElseThrow(() -> new RuntimeException("Watchlist item not found"));
        watchlistRepository.delete(watchlist);
    }
}
