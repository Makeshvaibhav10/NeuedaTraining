DELIMITER $$

CREATE PROCEDURE place_order_by_symbol (
    IN in_symbol VARCHAR(10),
    IN in_order_type ENUM('BUY', 'SELL'),
    IN in_quantity INT,
    IN in_price DECIMAL(10,2)
)
BEGIN
    DECLARE v_stock_id INT;

    -- Validate input
    IF in_quantity <= 0 OR in_price <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Quantity and price must be positive';
    END IF;

    SELECT stock_id INTO v_stock_id FROM stocks WHERE symbol = in_symbol;

    IF v_stock_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid stock symbol';
    END IF;

    INSERT INTO orders (stock_id, order_type, quantity, price)
    VALUES (v_stock_id, in_order_type, in_quantity, in_price);
END$$

DELIMITER ;


DELIMITER $$

DELIMITER $$

drop procedure execute_order_by_symbol


DELIMITER $$

CREATE PROCEDURE execute_order_by_symbol(IN in_symbol VARCHAR(10))
BEGIN
    DECLARE v_order_id BIGINT;
    DECLARE v_stock_id INT;
    DECLARE v_order_type ENUM('BUY', 'SELL');
    DECLARE v_quantity INT;
    DECLARE v_price DECIMAL(10,2);
    DECLARE v_total_value DECIMAL(15,2);
    DECLARE v_wallet_balance DECIMAL(15,2);
    DECLARE v_existing_qty INT;
    DECLARE v_row_count INT;

    -- Begin atomic transaction
    START TRANSACTION;

    -- Resolve stock_id from symbol
    SELECT stock_id INTO v_stock_id FROM stocks WHERE symbol = in_symbol;

    IF v_stock_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid stock symbol';
    END IF;

    -- Get earliest pending order
    SELECT order_id, order_type, quantity, price
    INTO v_order_id, v_order_type, v_quantity, v_price
    FROM orders
    WHERE stock_id = v_stock_id AND order_status = 'PENDING'
    ORDER BY created_at ASC
    LIMIT 1;

    SET v_total_value = v_quantity * v_price;

    SELECT available_balance INTO v_wallet_balance FROM wallet;

    -- BUY flow
    IF v_order_type = 'BUY' THEN
        IF v_wallet_balance < v_total_value THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient wallet balance';
        END IF;

        -- Deduct funds
        UPDATE wallet
        SET available_balance = available_balance - v_total_value;

        -- Check if user already owns the stock
        SELECT COUNT(*) INTO v_row_count
        FROM portfolio
        WHERE stock_id = v_stock_id;

        IF v_row_count > 0 THEN
            SELECT quantity INTO v_existing_qty
            FROM portfolio
            WHERE stock_id = v_stock_id;

            UPDATE portfolio
            SET 
                quantity = quantity + v_quantity,
                avg_buy_price = ((avg_buy_price * v_existing_qty) + (v_price * v_quantity)) / (v_existing_qty + v_quantity),
                total_invested = total_invested + v_total_value
            WHERE stock_id = v_stock_id;
        ELSE
            INSERT INTO portfolio (stock_id, quantity, avg_buy_price, total_invested)
            VALUES (v_stock_id, v_quantity, v_price, v_total_value);
        END IF;

    -- SELL flow
    ELSEIF v_order_type = 'SELL' THEN
        SELECT COUNT(*) INTO v_row_count
        FROM portfolio
        WHERE stock_id = v_stock_id;

        IF v_row_count = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No holdings available to sell';
        END IF;

        SELECT quantity INTO v_existing_qty
        FROM portfolio
        WHERE stock_id = v_stock_id;

        IF v_existing_qty < v_quantity THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Not enough shares to sell';
        END IF;

        UPDATE portfolio
        SET quantity = quantity - v_quantity,
            total_invested = total_invested - (avg_buy_price * v_quantity)
        WHERE stock_id = v_stock_id;

        UPDATE wallet
        SET available_balance = available_balance + v_total_value;
    END IF;

    -- Log transaction
    INSERT INTO transactions (
        transaction_type,
        amount,
        stock_id,
        order_id,
        remarks,
        quantity,
        price,
        transaction_date
    )
    VALUES (
        v_order_type,
        v_total_value,
        v_stock_id,
        v_order_id,
        'Executed order via procedure',
        v_quantity,
        v_price,
        NOW()
    );

    -- Mark order as fulfilled
    UPDATE orders
    SET order_status = 'COMPLETED',
        executed_at = NOW()
    WHERE order_id = v_order_id;

    -- Finish atomic block
    COMMIT;
END$$

DELIMITER ;


CREATE PROCEDURE cancel_order_by_symbol (
    IN in_symbol VARCHAR(10),
    IN in_order_id BIGINT
)
BEGIN
    DECLARE v_stock_id INT;

    SELECT stock_id INTO v_stock_id FROM stocks WHERE symbol = in_symbol;

    UPDATE orders
    SET order_status = 'CANCELLED'
    WHERE order_id = in_order_id AND stock_id = v_stock_id AND order_status = 'PENDING';

    INSERT INTO transactions (transaction_type, amount, stock_id, order_id, remarks)
    VALUES ('CANCELLED', 0.00, v_stock_id, in_order_id, 'Order cancelled');
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE calculate_portfolio_snapshot()
BEGIN
    DECLARE v_port_value DECIMAL(15,2);
    DECLARE v_cash_balance DECIMAL(15,2);
    DECLARE v_profit_loss DECIMAL(15,2);

    SELECT available_balance INTO v_cash_balance FROM wallet;

    SELECT SUM(p.quantity * s.current_price) INTO v_port_value
    FROM portfolio p JOIN stocks s ON p.stock_id = s.stock_id;

    SELECT SUM((p.quantity * s.current_price) - p.total_invested) INTO v_profit_loss
    FROM portfolio p JOIN stocks s ON p.stock_id = s.stock_id;

    INSERT INTO analytics_snapshots (portfolio_value, cash_balance, total_profit_loss)
    VALUES (v_port_value, v_cash_balance, v_profit_loss);
END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE get_portfolio_summary_by_symbol (
    IN in_symbol VARCHAR(10)
)
BEGIN
    DECLARE v_stock_id INT;

    SELECT stock_id INTO v_stock_id FROM stocks WHERE symbol = in_symbol;

    SELECT 
        s.symbol,
        s.name AS stock_name,
        p.quantity,
        p.avg_buy_price,
        p.total_invested,
        ROUND(p.quantity * s.current_price, 2) AS current_value,
        ROUND((p.quantity * s.current_price) - p.total_invested, 2) AS profit_loss
    FROM portfolio p
    JOIN stocks s ON p.stock_id = s.stock_id
    WHERE p.stock_id = v_stock_id;
END$$

DELIMITER ;

