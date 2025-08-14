-- WALLET
INSERT INTO wallet (available_balance, total_deposit, total_withdrawal)
VALUES (50000.00, 100000.00, 50000.00);

-- STOCKS
INSERT INTO stocks (symbol, name, sector, exchange, current_price, last_updated)
VALUES
('AAPL', 'Apple Inc.', 'Technology', 'NASDAQ', 180.50, NOW()),
('GOOGL', 'Alphabet Inc.', 'Technology', 'NASDAQ', 2700.75, NOW()),
('TSLA', 'Tesla Inc.', 'Automotive', 'NASDAQ', 710.30, NOW()),
('TC', 'TechCorp', 'Software', 'NYSE', 120.00, NOW());

-- STOCK PRICES
INSERT INTO stock_prices (stock_id, price_date, open, high, low, close, volume)
VALUES
(1, '2024-08-01', 179.00, 182.00, 178.50, 180.50, 32000000),
(2, '2024-08-01', 2680.00, 2720.00, 2675.00, 2700.75, 1900000),
(3, '2024-08-01', 700.00, 715.00, 695.00, 710.30, 24000000),
(4, '2024-08-01', 118.00, 122.00, 117.50, 120.00, 4500000);

-- ORDERS
INSERT INTO orders (stock_id, order_type, quantity, price, order_status, created_at)
VALUES
(1, 'BUY', 10, 180.00, 'COMPLETED', NOW()),
(2, 'SELL', 5, 2700.00, 'COMPLETED', NOW()),
(3, 'BUY', 20, 710.00, 'PENDING', NOW()),
(4, 'BUY', 15, 120.00, 'PENDING', NOW());

-- PORTFOLIO
INSERT INTO portfolio (stock_id, quantity, avg_buy_price, total_invested)
VALUES
(1, 10, 180.00, 1800.00),
(2, 10, 2600.00, 26000.00),
(4, 15, 120.00, 1800.00);

-- TRANSACTIONS
INSERT INTO transactions (transaction_type, amount, stock_id, order_id, remarks, quantity, price)
VALUES
('BUY', 1800.00, 1, 1, 'Initial purchase of AAPL', 10, 180.00),
('SELL', 13500.00, 2, 2, 'Partial sale of GOOGL', 5, 2700.00),
('DEPOSIT', 50000.00, NULL, NULL, 'Initial deposit', NULL, NULL),
('WITHDRAWAL', 1000.00, NULL, NULL, 'ATM withdrawal', NULL, NULL);

-- WATCHLIST
INSERT INTO watchlist (stock_id)
VALUES (1), (3), (4);

-- ANALYTICS SNAPSHOTS
INSERT INTO analytics_snapshots (portfolio_value, cash_balance, total_profit_loss)
VALUES
(29600.00, 50000.00, 800.00),
(28000.00, 49000.00, 500.00);
