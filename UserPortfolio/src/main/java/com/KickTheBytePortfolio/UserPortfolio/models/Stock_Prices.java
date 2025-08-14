package com.KickTheBytePortfolio.UserPortfolio.models;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "stock_prices", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"stock_id", "price_date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Stock_Prices {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "price_id")
    private Long priceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Column(name = "price_date", nullable = false)
    private LocalDate priceDate;

    @Column(name = "open", precision = 10, scale = 2)
    private BigDecimal open;

    @Column(name = "high", precision = 10, scale = 2)
    private BigDecimal high;

    @Column(name = "low", precision = 10, scale = 2)
    private BigDecimal low;

    @Column(name = "close", precision = 10, scale = 2)
    private BigDecimal close;

    @Column(name = "volume")
    private Long volume;

    // Remove the empty setStock method - Lombok will generate it automatically
}