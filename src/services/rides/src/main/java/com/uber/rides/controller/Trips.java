package com.uber.rides.controller;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import javax.validation.constraints.Min;
import javax.validation.constraints.Size;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import static com.speedment.jpastreamer.streamconfiguration.StreamConfiguration.*;
import static com.uber.rides.util.Utils.*;

import com.uber.rides.database.DbContext;
import com.uber.rides.dto.TripDTO;
import com.uber.rides.dto.user.UserDTO;
import com.uber.rides.model.Car;
import com.uber.rides.model.Location;
import com.uber.rides.model.Route;
import com.uber.rides.model.Route$;
import com.uber.rides.model.Trip;
import com.uber.rides.model.Trip$;
import com.uber.rides.model.User;
import com.uber.rides.model.User$;
import com.uber.rides.model.User.Roles;
import com.uber.rides.service.GoogleMaps;
import com.uber.rides.service.ImageStore;
import com.uber.rides.ws.Store;
import com.uber.rides.ws.WS;
import com.uber.rides.ws.rider.messages.out.TripInvite;

@RestController
@RequestMapping("/trips")
public class Trips extends Controller {

    static final long PAGE_SIZE = 8;

    @Autowired DbContext context;
    @Autowired Store store;
    @Autowired ImageStore images;
    @Autowired GoogleMaps maps;
    @Autowired WS ws;

    @PostMapping("/invite-passengers")
    @Secured({ Roles.RIDER })
    public Object invitePassengers(@RequestBody @Validated @Size(max=3) List<Long> passengerIds) {

        var riderData = store.riders.get(authenticatedUserId());
        if (riderData == null) {
            return badRequest(CONNECTION_ENDED);
        }

        var trip = riderData.getCurrentTrip();
        if (trip == null) {
            return badRequest("You are currenly not looking for a ride. Please start by choosing a route.");
        }

        var newPassengers = new ArrayList<>(passengerIds);
        newPassengers.removeAll(riderData.getInvitedPassengerIds());
        riderData.setInvitedPassengerIds(passengerIds);

        var inviter = mapper.map(riderData.user, UserDTO.class);
        var tripDTO = mapper.map(trip, TripDTO.class);
        for (var id : newPassengers) {
            if (trip.getRiders().stream().noneMatch(r -> r.getId().equals(id))) {
                ws.sendMessageToUser(id, new TripInvite(inviter, tripDTO));
            }
        }

        return ok();

    }

    @PostMapping("/choose-ride")
    @Secured({ Roles.RIDER })
    public Object chooseRide(@Validated @RequestParam Car.Types rideType) {

        var riderData = store.riders.get(authenticatedUserId());
        if (riderData == null) {
            return badRequest(CONNECTION_ENDED);
        }

        var trip = riderData.getCurrentTrip();
        if (trip == null) {
            return badRequest("You are currenly not looking for a ride. Please start by choosing a route.");
        } 

        if (trip.getCar() != null) {
            trip.setTotalPrice(riderData.getCarPricesInUsd().get(rideType));
            trip.setCar(Car.builder().type(Car.getByType(rideType)).build());
            return ok();
        }

        var directionsRoute = riderData.getDirections().routes[0];
        var thumbnail = maps.getRouteThumbnail(directionsRoute);

        if (thumbnail.length == 0) {
            return badRequest("Could not get route thumbnail at this time. Please try again later.");
        }

        var thumbnailUrl = images.persist(thumbnail, ".png");

        var distance = Stream
            .of(directionsRoute.legs)
            .mapToLong(leg -> leg.distance.inMeters / 1000)
            .sum();

        var leg = directionsRoute.legs[0];
        var routeBuilder = Route
            .builder()
            .start(new Location(leg.startAddress, leg.startLocation.lng, leg.startLocation.lat, 0))
            .distance(distance)
            .encodedPolyline(directionsRoute.overviewPolyline.getEncodedPath())
            .neBounds(Location
                .builder()
                .longitude(directionsRoute.bounds.northeast.lng)
                .latitude(directionsRoute.bounds.northeast.lat)
                .build()
            )
            .swBounds(Location
                .builder()
                .longitude(directionsRoute.bounds.southwest.lng)
                .latitude(directionsRoute.bounds.southwest.lat)
                .build()
            )
            .thumbnail(thumbnailUrl);

        if (directionsRoute.legs.length == 1) { // Only origin and destination
            routeBuilder = routeBuilder.stops(
                List.of(new Location(leg.endAddress, leg.endLocation.lng, leg.endLocation.lat, 1))
            );
        }
        else {
            routeBuilder = routeBuilder.stops(
                IntStream
                .range(0, directionsRoute.legs.length)
                .mapToObj(i -> new Location(
                    directionsRoute.legs[i].endAddress, 
                    directionsRoute.legs[i].endLocation.lng, 
                    directionsRoute.legs[i].endLocation.lat, 
                    i
                ))
                .toList()
            );
        }

        trip.setRoute(routeBuilder.build());

        return ok();
    }

    @Transactional
    @GetMapping("")
    @Secured({ Roles.DRIVER, Roles.RIDER, Roles.ADMIN })
    public Object getTrips(@RequestParam Long userId, @RequestParam @Min(0) int page, @RequestParam String order) {

        var userRole = authenticatedUserRole();
        var isAdmin = Roles.ADMIN.equals(userRole);
        var isDriver = Roles.DRIVER.equals(userRole);
        if (
            !userId.equals(authenticatedUserId()) &&
            !isAdmin
        ) {
            return badRequest("Cannot view other users' trips.");
        }

        if (!isAdmin) {
            userId = authenticatedUserId();
        }

        Comparator<Trip> comparator;
        
        if (order.equalsIgnoreCase("PRICE_ASC")) {
            comparator = Trip$.totalPrice;
        }
        else if (order.equalsIgnoreCase("PRICE_DESC")) {
            comparator = Trip$.totalPrice.reversed();
        }
        else if (order.equalsIgnoreCase("START_ASC")) {
            comparator = Trip$.startedAt;
        }
        else {
            comparator = Trip$.startedAt.reversed();
        }

        Stream<List<Trip>> stream;
        var user = context.readonlyQuery().stream(User.class)
            .filter(User$.id.equal(userId));

        if (isDriver) {
            stream = user.map(User::getTripsAsDriver);

        }
        else {
            stream = user.map(User::getTripsAsRider);
        }

        var trips = stream
            .flatMap(Collection::stream)
            .collect(Collectors.toList())
            .stream()
            .sorted(comparator)
            .skip(page * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .toList();
        
        var routes = context.readonlyQuery().stream(
                of(Route.class)
                .joining(Route$.stops)
            )
            .filter(Route$.id.in(trips.stream().map(Trip::getRouteId).toList()))
            .collect(Collectors.toMap(Route::getId, Function.identity()));
        
        return context.readonlyQuery().stream(
                of(Trip.class)
                .joining(Trip$.driver)
                .joining(Trip$.riders)
                .joining(Trip$.payments)
            )
            .filter(Trip$.id.in(trips.stream().map(Trip::getId).toList()))
            .sorted(comparator)
            .map(trip -> {
                trip.setRoute(routes.get(trip.getRouteId()));
                return mapper.map(trip, TripDTO.class);
            })
            .toList();

    }
}
