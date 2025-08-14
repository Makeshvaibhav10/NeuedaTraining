package com.KickTheBytePortfolio.UserPortfolio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "com.KickTheBytePortfolio.UserPortfolio.models") // Only scan models package
public class UserPortfolioApplication {
	public static void main(String[] args) {
		SpringApplication.run(UserPortfolioApplication.class, args);
	}
}