package com.uber.rides;

import com.google.maps.errors.ApiException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.integration.config.EnableIntegration;

import java.io.IOException;

@EnableIntegration
@SpringBootApplication
public class UberRidesApplication {

    public static void main(String[] args) throws ApiException, InterruptedException, IOException {
        SpringApplication.run(UberRidesApplication.class, args);

        // GeoApiContext context = new GeoApiContext.Builder()
        // 	.apiKey("AIzaSyCkUOdZ5y7hMm0yrcCQoCvLwzdM6M8s5qk")
        // 	.build();
        // GeocodingResult[] results =  GeocodingApi.geocode(context,
        // 	"1600 Amphitheatre Parkway Mountain View, CA 94043").await();
        // System.out.println(results[0].addressComponents);

        // // Invoke .shutdown() after your application is done making requests
        // context.shutdown();
    }
}