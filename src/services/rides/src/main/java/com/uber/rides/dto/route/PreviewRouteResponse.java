package com.uber.rides.dto.route;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.google.maps.model.DirectionsRoute;

import com.uber.rides.model.Car;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PreviewRouteResponse {
    
    List<Car.Type> carTypes;
    DirectionsRoute[] routes;
    Map<Car.Types, Double> carPricesInUsd;
    long distanceInMeters;
    long durationInSeconds;

}
