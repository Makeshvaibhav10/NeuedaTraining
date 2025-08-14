package com.KickTheBytePortfolio.UserPortfolio.dto;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class StockPriceResponse {
    @JsonProperty("companyName")
    private String companyName;

    @JsonProperty("periodNumber")
    private Integer periodNumber;

    @JsonProperty("price")
    private BigDecimal price;

    @JsonProperty("symbol")
    private String symbol;

    @JsonProperty("timeStamp")
    private String timeStamp;
}