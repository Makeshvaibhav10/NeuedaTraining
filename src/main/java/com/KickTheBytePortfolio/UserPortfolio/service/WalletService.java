package com.KickTheBytePortfolio.UserPortfolio.service;

import com.KickTheBytePortfolio.UserPortfolio.models.Portfolio;
import com.KickTheBytePortfolio.UserPortfolio.repositories.WalletRepository;
import com.KickTheBytePortfolio.UserPortfolio.repositories.PortfolioRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.KickTheBytePortfolio.UserPortfolio.models.Wallet; // Correct import
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    /**
     * Get wallet by portfolio ID (since wallets are tied to portfolios, not users directly)
     */
    public Wallet getWalletByPortfolioId(Long portfolioId) {
        return walletRepository.findByPortfolioId(portfolioId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for portfolio: " + portfolioId));
    }

    /**
     * Create wallet for a specific portfolio
     */
    public Wallet createWalletForPortfolio(Long portfolioId, BigDecimal initialBalance) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found: " + portfolioId));

        Wallet wallet = new Wallet(portfolio, initialBalance);
        return walletRepository.save(wallet);
    }

    /**
     * Get or create default wallet for a portfolio
     */
    public Wallet getOrCreateWalletForPortfolio(Long portfolioId) {
        Optional<Wallet> existingWallet = walletRepository.findByPortfolioId(portfolioId);
        if (existingWallet.isPresent()) {
            return existingWallet.get();
        }

        // Create wallet with the portfolio's current cash balance
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found: " + portfolioId));

        return createWalletForPortfolio(portfolioId, portfolio.getCashBalance());
    }

    /**
     * Check if portfolio has enough balance
     */
    public boolean hasEnoughBalance(Long portfolioId, BigDecimal amount) {
        Wallet wallet = getWalletByPortfolioId(portfolioId);
        return wallet.getBalance().compareTo(amount) >= 0;
    }

    /**
     * Deduct balance from portfolio wallet
     */
    public void deductBalance(Long portfolioId, BigDecimal amount) {
        Wallet wallet = getWalletByPortfolioId(portfolioId);
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);
    }

    /**
     * Add balance to portfolio wallet
     */
    public void addBalance(Long portfolioId, BigDecimal amount) {
        Wallet wallet = getWalletByPortfolioId(portfolioId);
        wallet.setBalance(wallet.getBalance().add(amount));
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);
    }

    /**
     * Update balance for portfolio wallet
     */
    public void updateBalance(Long portfolioId, BigDecimal newBalance) {
        walletRepository.updateBalanceByPortfolioId(portfolioId, newBalance, LocalDateTime.now());
    }

    /**
     * Get wallet balance for a portfolio
     */
    public BigDecimal getBalance(Long portfolioId) {
        Wallet wallet = getWalletByPortfolioId(portfolioId);
        return wallet.getBalance();
    }

    /**
     * Sync wallet balance with portfolio cash balance
     */
    public void syncWalletWithPortfolio(Long portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found: " + portfolioId));

        Wallet wallet = getOrCreateWalletForPortfolio(portfolioId);
        wallet.setBalance(portfolio.getCashBalance());
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);
    }
}