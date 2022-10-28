package com.uber.rides;

import java.io.IOException;

import org.springframework.boot.SpringApplication;
import org.springframework.integration.config.EnableIntegration;

import com.google.maps.DirectionsApi;
import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.errors.ApiException;
import com.google.maps.model.GeocodingResult;

import org.springframework.boot.autoconfigure.SpringBootApplication;

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