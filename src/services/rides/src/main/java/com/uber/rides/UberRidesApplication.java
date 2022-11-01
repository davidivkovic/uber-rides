package com.uber.rides;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.integration.config.EnableIntegration;

@EnableIntegration
@ComponentScan(basePackages = "com.speedment.jpastreamer.application")
@SpringBootApplication
public class UberRidesApplication {

    public static void main(String[] args) {
        SpringApplication.run(UberRidesApplication.class, args);
    }

}