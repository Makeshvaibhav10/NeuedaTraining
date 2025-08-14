// Database Schema SQL (for reference)
-- Create database
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;



CREATE TABLE IF NOT EXISTS portfolios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    portfolio_name VARCHAR(255) NOT NULL,
    total_value DECIMAL(15,2) DEFAULT 0.00,
    cash_balance DECIMAL(15,2) DEFAULT 0.00,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    portfolio_id BIGINT NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    order_type ENUM('BUY', 'SELL') NOT NULL,
    order_status ENUM('PENDING', 'EXECUTED', 'CANCELLED', 'FAILED') DEFAULT 'PENDING',
    quantity INT NOT NULL,
    price DECIMAL(10,2),
    total_amount DECIMAL(15,2),
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    executed_date DATETIME,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stocks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    portfolio_id BIGINT NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    company_name VARCHAR(255),
    quantity INT DEFAULT 0,
    average_price DECIMAL(10,2) DEFAULT 0.00,
    current_value DECIMAL(15,2) DEFAULT 0.00,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
);

Drop Table 

CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    portfolio_id BIGINT NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    transaction_type ENUM('BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL') NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS watchlists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    portfolio_id BIGINT NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    company_name VARCHAR(255),
    added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wallets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    portfolio_id BIGINT NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    portfolio_id BIGINT NOT NULL,
    snapshot_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_value DECIMAL(15,2) NOT NULL,
    cash_balance DECIMAL(15,2) NOT NULL,
    stocks_value DECIMAL(15,2) NOT NULL,
    day_change DECIMAL(15,2) DEFAULT 0.00,
    day_change_percent DECIMAL(5,2) DEFAULT 0.00,
    total_profit_loss DECIMAL(15,2) DEFAULT 0.00,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
);
USE portfolio_db;
ALTER TABLE transactions CHANGE COLUMN id transaction_id BIGINT AUTO_INCREMENT;
describe transactions

-- Add current_price column to stocks table
ALTER TABLE stocks 
ADD COLUMN current_price DECIMAL(19,2);

-- Update existing records to set current_price equal to average_price initially
UPDATE stocks 
SET current_price = average_price 
WHERE current_price IS NULL;

-- Optional: Add index for better performance on symbol lookups
CREATE INDEX idx_stocks_symbol ON stocks(symbol);

-- Optional: Add index for portfolio-based queries
CREATE INDEX idx_stocks_portfolio_id ON stocks(portfolio_id);

select * from analytics_snapshots

select * from orders;


USE portfolio_db;
ALTER TABLE transactions DROP COLUMN user_id;