package com.uber.rides.model;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.function.ToLongFunction;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OrderBy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.beans.factory.annotation.Autowired;

import com.google.maps.model.DirectionsLeg;
import com.google.maps.model.DirectionsRoute;
import com.uber.rides.controller.Routes;
import com.uber.rides.dto.route.PreviewRouteResponse;
import com.uber.rides.model.Trip.Status;
import com.uber.rides.service.GoogleMaps;
import com.uber.rides.util.Utils.Result;
import com.uber.rides.ws.rider.RiderData;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Route {
    
    @Id @GeneratedValue Long id;
    String name;
    String thumbnail;
    @Column(length = 8192) String encodedPolyline;
    double distance;
    @Embedded Location swBounds;
    @Embedded Location neBounds;
    @Embedded Location start;
    @ElementCollection(fetch = FetchType.EAGER) @OrderBy("order") List<Location> stops;

    public String getThumbnail() {
        return linkTo(methodOn(Routes.class).getThumbnail(thumbnail)).toString();
    }

    @org.springframework.stereotype.Service
    public static class Service {

        @Autowired GoogleMaps maps;

        public Result<PreviewRouteResponse> previewRoute(
            RiderData rider,
            String originPlaceId,
            String destinationPlaceId,
            String[] waypointPlaceIds,
            boolean optimizeWaypoints,
            boolean optimizeCost,
            LocalDateTime scheduledAt
        ) {

            var directions = maps.getDirections(
                originPlaceId,
                destinationPlaceId,
                waypointPlaceIds,
                scheduledAt,
                optimizeWaypoints
            );
    
            if (directions == null || directions.routes.length == 0) {
                return Result.error("Could not get directions for specified route. Please try again later.");
            }
    
            if (optimizeWaypoints) {
                ToLongFunction<DirectionsLeg> extractor = optimizeCost
                    ? leg -> leg.distance.inMeters
                    : leg -> leg.duration.inSeconds;
    
                directions.routes = new DirectionsRoute[] { 
                    Stream
                    .of(directions.routes)
                    .min(Comparator
                        .comparingLong(r -> Stream
                            .of(r.legs)
                            .mapToLong(extractor)
                            .sum()
                        )
                    )
                    .orElse(directions.routes[0])
                };
            }
            else {
                directions.routes = new DirectionsRoute[] { directions.routes[0] }; 
            }
    
            var distance = Stream
                .of(directions.routes[0].legs)
                .mapToLong(leg -> leg.distance.inMeters)
                .sum();
    
            var duration = Stream
                .of(directions.routes[0].legs)
                .mapToLong(leg -> leg.duration.inSeconds)
                .sum();
    
            var pricesInUsd = Car.getAvailableTypes()
               .stream()
               .collect(Collectors.toMap(
                    Car.Type::getCarType,
                    t -> (double) Math.round(t.getPaymentMultiplier() * distance / 1000 * 2.4 * 10) / 10
                ));
    
            if (rider != null) {
                var trip = Trip.builder()
                    .status(Status.BUILDING)
                    .durationInSeconds(duration)
                    .distanceInMeters(distance)
                    .riders(new HashSet<>(Arrays.asList(rider.user)))
                    .ownerId(rider.user.getId())
                    .build();
    
                if (scheduledAt != null) {
                    trip.setScheduled(true);
                    trip.setScheduledAt(scheduledAt);
                }
                rider.setDirections(directions);
                rider.setCarPricesInUsd(pricesInUsd);
                rider.getUser().setCurrentTrip(trip);
            }
            
            return Result.value(
                new PreviewRouteResponse(
                    Car.getAvailableTypes(), 
                    directions.routes, 
                    pricesInUsd, 
                    distance, 
                    duration
                )
            );
        }
    }

}