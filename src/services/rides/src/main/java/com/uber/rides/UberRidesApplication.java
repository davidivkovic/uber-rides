package com.uber.rides;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.integration.config.EnableIntegration;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableIntegration
@EnableAsync
@SpringBootApplication
public class UberRidesApplication {

    public static void main(String[] args) {
        SpringApplication.run(UberRidesApplication.class, args);
    }

}