package com.uber.rides.controller;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import javax.validation.constraints.Min;
import javax.validation.constraints.Size;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import static com.speedment.jpastreamer.streamconfiguration.StreamConfiguration.*;

import com.uber.rides.database.DbContext;
import com.uber.rides.dto.TripDTO;
import com.uber.rides.dto.user.UserDTO;
import com.uber.rides.model.Car;
import com.uber.rides.model.Location;
import com.uber.rides.model.Payment;
import com.uber.rides.model.Rating;
import com.uber.rides.model.Route;
import com.uber.rides.model.Route$;
import com.uber.rides.model.Trip;
import com.uber.rides.model.Trip$;
import com.uber.rides.model.User;
import com.uber.rides.model.User$;
import com.uber.rides.model.Trip.Status;
import com.uber.rides.model.User.Roles;
import com.uber.rides.service.GoogleMaps;
import com.uber.rides.service.ImageStore;
import com.uber.rides.simulator.DriverSimulator;
import com.uber.rides.ws.Store;
import com.uber.rides.ws.WS;
import com.uber.rides.ws.driver.DriverData;
import com.uber.rides.ws.driver.messages.out.TripAssigned;
import com.uber.rides.ws.driver.messages.out.TripCancelled;
import com.uber.rides.ws.driver.messages.out.TripStarted;
import com.uber.rides.ws.rider.messages.out.TripInvite;
import com.uber.rides.ws.rider.messages.out.UberUpdate;

import static com.uber.rides.util.Utils.*;
import static com.uber.rides.util.GeoUtils.*;

@RestController
@RequestMapping("/trips")
public class Trips extends Controller {

    static final long PAGE_SIZE = 8;
    static final String NOT_LOOKING = "You are currenly not looking for a ride. Please start by choosing a route.";

    @Autowired DbContext context;
    @Autowired Store store;
    @Autowired ImageStore images;
    @Autowired GoogleMaps maps;
    @Autowired WS ws;
    @Autowired ThreadPoolTaskScheduler scheduler;
    @Autowired DriverSimulator simulator;

    @Autowired Trip.Service trips;
    @Autowired Route.Service routes;

    @PostMapping("/cancel")
    @Secured({ Roles.DRIVER })
    @Transactional
    public Object cancelTrip(@RequestParam String reason) {
        var driverData = store.drivers.get(authenticatedUserId());
        if (driverData == null) return badRequest(CONNECTION_ENDED);

        var trip = driverData.getUser().getCurrentTrip();
        if (trip == null) return badRequest("You are currently not on a trip.");

        trips.cancelTrip(driverData, trip, reason);

        return ok();
    }

    @PostMapping("/start")
    @Secured({ Roles.DRIVER })
    @Transactional
    public Object startTrip() {
        var driverData = store.drivers.get(authenticatedUserId());
        if (driverData == null) {
            return badRequest(CONNECTION_ENDED);
        }

        var trip = driverData.getUser().getCurrentTrip();
        if (trip == null) {
            return badRequest("You are currently not on a trip. Please start by choosing a route.");
        }

        var result = trips.startTrip(driverData, trip);
        if (!result.success()) return badRequest(result.error());
        return ok();
    }

    @PostMapping("/order-ride")
    @Secured({ Roles.RIDER })
    @Transactional
    public Object orderRide() {
        var riderData = store.riders.get(authenticatedUserId());
        if (riderData == null) return badRequest(CONNECTION_ENDED);

        var trip = riderData.getUser().getCurrentTrip();
        if (trip == null || trip.getRoute() == null) return badRequest(NOT_LOOKING);

        var result = trips.orderRide(trip);
        if (!result.success()) return badRequest(result.error());
        return ok();
    }

    @PostMapping("/invite-passengers")
    @Secured({ Roles.RIDER })
    public Object invitePassengers(@RequestBody @Validated @Size(max=3) List<Long> passengerIds) {

        var riderData = store.riders.get(authenticatedUserId());
        if (riderData == null) {
            return badRequest(CONNECTION_ENDED);
        }

        var trip = riderData.getUser().getCurrentTrip();
        if (trip == null) {
            return badRequest(NOT_LOOKING);
        }

        var invitedPassegers = riderData.getInvitedPassengerIds();
        var newPassengers = new ArrayList<>(passengerIds);
        if (invitedPassegers != null) {
            newPassengers.removeAll(invitedPassegers);
        }
        riderData.setInvitedPassengerIds(passengerIds);

        var inviter = mapper.map(riderData.user, UserDTO.class);
        var tripDTO = mapper.map(trip, TripDTO.class);
        for (var id : newPassengers) {
            if (trip.getRiders().stream().anyMatch(r -> r.getId().equals(id))) continue;
            ws.sendMessageToUser(id, new TripInvite(inviter, tripDTO));
        }

        return ok(tripDTO);

    }

    @PostMapping("/choose-ride")
    @Secured({ Roles.RIDER })
    public Object chooseRide(@Validated @RequestParam Car.Types rideType) {
        var riderData = store.riders.get(authenticatedUserId());
        if (riderData == null) return badRequest(CONNECTION_ENDED);

        var trip = riderData.getUser().getCurrentTrip();
        if (trip == null) return badRequest(NOT_LOOKING);

        var result = trips.chooseRide(riderData, trip, rideType);

        if (!result.success()) return badRequest(result.error());
        return ok(mapper.map(result.result(), TripDTO.class));
    }

    @Transactional
    @PostMapping("/{id}/review")
    @Secured({ Roles.RIDER })
    public Object reviewTrip(@PathVariable("id") Long tripId, @RequestParam double rating, @RequestParam String comment) {

        var trip = context.db().getReference(Trip.class, tripId);
        if (trip == null) {
            return badRequest("Trip not found.");
        }

        var user = context.db().getReference(User.class, authenticatedUserId());
        var review = new Rating(trip, user, rating, comment);
        context.db().persist(review);

        trip.getRatings().add(review);

        return ok();

    }

    @Transactional
    @GetMapping("/current")
    @Secured({ Roles.ADMIN })
    public Object getCurrentTrip(@RequestParam Long userId) {

        var user = context.query().stream(
            of(User.class)
            .joining(User$.car)
        )
        .filter(User$.id.equal(userId))
        .findFirst()
        .orElse(null);

        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        var trip = ws.getCurrentTrip(user);
        if (trip == null) {
            trip = new Trip();
            trip.setDriver(user);
            trip.setCar(user.getCar());
        }

        return ok(mapper.map(trip, TripDTO.class));

    }

    @Transactional(readOnly = true)
    @GetMapping("")
    @Secured({ Roles.DRIVER, Roles.RIDER, Roles.ADMIN })
    public Object getTrips(@RequestParam Long userId, @RequestParam @Min(0) int page, @RequestParam String order) {

        var user = context.db().find(User.class, userId);
        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }
        var isDriver = user.getRole().equals(Roles.DRIVER);
        var currentTrip = ws.getCurrentTrip(user);
        var addCurrentTrip = currentTrip != null && (
            currentTrip.getStatus() == Trip.Status.AWAITING_PICKUP || 
            currentTrip.getStatus() == Trip.Status.IN_PROGRESS      
        );

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
        var userQuery = context.query().stream(User.class)
            .filter(User$.id.equal(userId));

        if (isDriver) {
            stream = userQuery.map(User::getTripsAsDriver);
        }
        else {
            stream = userQuery.map(User::getTripsAsRider);
        }

        var trips = stream
            .flatMap(Collection::stream)
            .filter(
                Trip$.status.equal(Trip.Status.COMPLETED)
                .or(Trip$.status.equal(Trip.Status.SCHEDULED))
                .or(
                    Trip$.status.equal(Trip.Status.PAID)
                    .and(Trip$.scheduled)
                    .and(Trip$.scheduledAt.greaterThan(LocalDateTime.now()))
                )
            )
            .toList()
            .stream()
            .sorted(comparator)
            .skip(page * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .collect(Collectors.toList());

        if (addCurrentTrip) trips.add(0, currentTrip);
        
        var routes = context.query().stream(
                of(Route.class)
                .joining(Route$.stops)
            )
            .filter(Route$.id.in(trips.stream().map(Trip::getRouteId).toList()))
            .collect(Collectors.toMap(Route::getId, Function.identity(), (rId1, rId2) -> rId1));
        
        return context.query().stream(
                of(Trip.class)
                .joining(Trip$.driver)
                .joining(Trip$.riders)
                // .joining(Trip$.payments)
                .joining(Trip$.ratings)
                .joining(Trip$.car)
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
