package com.uber.rides.controller;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import javax.validation.constraints.Min;
import javax.validation.constraints.Size;
import javax.websocket.server.PathParam;

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
import com.uber.rides.ws.driver.messages.out.TripStarted;
import com.uber.rides.ws.rider.messages.out.TripInvite;
import com.uber.rides.ws.rider.messages.out.UberUpdate;

import static com.uber.rides.util.Utils.*;
import static com.uber.rides.util.GeoUtils.*;

@RestController
@RequestMapping("/trips")
public class Trips extends Controller {

    static final long PAGE_SIZE = 8;

    @Autowired DbContext context;
    @Autowired Store store;
    @Autowired ImageStore images;
    @Autowired GoogleMaps maps;
    @Autowired WS ws;
    @Autowired ThreadPoolTaskScheduler scheduler;
    @Autowired DriverSimulator simulator;

    @Autowired Trip.Service tripService;
    @Autowired Route.Service routeService;

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

        var start = trip.getRoute().getStart();
        var distance = distance(
            driverData.getLatitude(),
            driverData.getLongitude(),
            start.getLatitude(),
            start.getLongitude()
        );

        if (distance > 50) {
            return badRequest("You are not in the right location to start the trip. Please move closer to the pickup location.");
        }

        var tripStarted = new TripStarted(mapper.map(trip, TripDTO.class));
        ws.sendMessageToUser(driverData.getUser().getId(), tripStarted);
        trip.getRiders().forEach(rider -> ws.sendMessageToUser(rider.getId(), tripStarted));
        
        simulator.runTask(driverData.getUser(), trip.getDirections(), true);
        trip.setStatus(Trip.Status.IN_PROGRESS);
        trip.setStartedAt(LocalDateTime.now());
        context.db().merge(trip);

        return ok();
    }

    @PostMapping("/order-ride")
    @Secured({ Roles.RIDER })
    @Transactional
    public Object orderRide() {
        var riderData = store.riders.get(authenticatedUserId());
        if (riderData == null) {
            return badRequest(CONNECTION_ENDED);
        }

        var trip = riderData.getUser().getCurrentTrip();
        if (trip == null || trip.getRoute() == null) {
            return badRequest("You are currenly not looking for a ride. Please start by choosing a route.");
        }

        trip.getRiders().forEach(r -> ws.sendMessageToUser(r.getId(), new UberUpdate(UberUpdate.Status.LOOKING)));

        var start = trip.getRoute().getStart();
        var driver = store
            .drivers
            .values()
            .stream()
            .filter(DriverData::isOnline)
            .filter(DriverData::isAvailable)
            .filter(d -> d.getUser().getCurrentTrip() == null)
            .filter(d -> d.getUser().getCar().getType().getCarType().equals(trip.getCar().getType().getCarType()))
            // also check if driver is scheduled in the future
            .min(Comparator.comparing(
                d -> distance(
                    d.getLatitude(), d.getLongitude(),
                    start.getLatitude(), start.getLongitude()
                )
            ))
            .orElse(null);

        if (driver == null) {
            return badRequest("No drivers available currently. Please try again later.");
        }

        synchronized (driver) {
            if (!driver.isAvailable()) {
                return badRequest("No drivers available currently. Please try again later.");
            }
            driver.setAvailable(false);
        }

        trip.setStatus(Trip.Status.CREATED);

        var pickupDirections = maps.getDirections(
            driver.latitude, 
            driver.longitude,  
            start.getLatitude(),
            start.getLongitude()
        );

        if (pickupDirections == null) {
            driver.setAvailable(true);
            // trip.getRiders().forEach(r -> ws.sendMessageToUser(r.getId(), new UberUpdate(UberUpdate.Status.NO_ROUTE)));
            return badRequest("Could not find a route to the start of the trip.");
        }

        trip.setDriver(driver.getUser());
        trip.setCar(driver.getUser().getCar());

        context.db().persist(trip);

        trip.getRiders().forEach(r -> ws.sendMessageToUser(r.getId(), new UberUpdate(UberUpdate.Status.FOUND)));

        //send a websoket message to the riders that a driver has been found
        // Do the actual payment here   

        var riderIds = trip.getRiders().stream().map(User::getId).toList();
        var payments = context.readonlyQuery()
            .stream(of(User.class).joining(User$.defaultPaymentMethod))
            .filter(User$.id.in(riderIds))
            .map(User::getDefaultPaymentMethod)
            .parallel()
            .map(m -> {
                if (m == null) return null;
                return m.authorize(trip.getTotalPrice() / riderIds.size(), "USD");
            })
            .toList();

        if (payments.stream().anyMatch(Objects::isNull)) {
            driver.setAvailable(true);
            payments.parallelStream().filter(Objects::nonNull).forEach(Payment::refund);
            trip.setStatus(Trip.Status.CANCELLED);
            trip.getRiders().forEach(r -> ws.sendMessageToUser(r.getId(), new UberUpdate(UberUpdate.Status.PAYMENT_FAILED)));
            return badRequest("Payment failed. Please try again later.");
        }

        driver.getUser().setCurrentTrip(trip);
        driver.setDirections(pickupDirections);
        trip.setPayments(payments);
        trip.setStatus(Trip.Status.PAID);

        var tripAssigned = new TripAssigned(trip, pickupDirections);
        scheduler.schedule(
            () -> trip.getRiders().forEach(r -> ws.sendMessageToUser(r.getId(), tripAssigned)),
            Instant.now().plusSeconds(3)
        );
        ws.sendMessageToUser(driver.getUser().getId(), tripAssigned);

        trip.setStatus(Status.AWAITING_PICKUP);
        simulator.runTask(driver.getUser(), pickupDirections.routes[0], false);

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
            return badRequest("You are currenly not looking for a ride. Please start by choosing a route.");
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
            if (trip.getRiders().stream().noneMatch(r -> r.getId().equals(id))) {
                ws.sendMessageToUser(id, new TripInvite(inviter, tripDTO));
            }
        }

        return ok(tripDTO);

    }

    @PostMapping("/choose-ride")
    @Secured({ Roles.RIDER })
    public Object chooseRide(@Validated @RequestParam Car.Types rideType) {

        var riderData = store.riders.get(authenticatedUserId());
        if (riderData == null) {
            return badRequest(CONNECTION_ENDED);
        }

        var trip = riderData.getUser().getCurrentTrip();
        if (trip == null) {
            return badRequest("You are currenly not looking for a ride. Please start by choosing a route.");
        } 
        
        var tripCarChosen = trip.getCar() != null;
        trip.setTotalPrice(riderData.getCarPricesInUsd().get(rideType));
        trip.setCar(Car.builder().type(Car.getByType(rideType)).build());

        if (tripCarChosen) {
            return ok(mapper.map(trip, TripDTO.class));
        }

        var directionsRoute = riderData.getDirections().routes[0];
        var thumbnail = maps.getRouteThumbnail(directionsRoute);

        if (thumbnail.length == 0) {
            return badRequest("Could not get route thumbnail at this time. Please try again later.");
        }

        var thumbnailUrl = images.persist(thumbnail, ".png");

        var distance = Stream
            .of(directionsRoute.legs)
            .mapToLong(leg -> leg.distance.inMeters)
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
        trip.setDirections(directionsRoute);
        var tripDTO = mapper.map(trip, TripDTO.class);

        return ok(tripDTO);
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
        var user = context.query().stream(User.class)
            .filter(User$.id.equal(userId));

        if (isDriver) {
            stream = user.map(User::getTripsAsDriver);
        }
        else {
            stream = user.map(User::getTripsAsRider);
        }

        var trips = stream
            .flatMap(Collection::stream)
            .filter(Trip$.status.equal(Trip.Status.COMPLETED))
            .toList()
            .stream()
            .sorted(comparator)
            .skip(page * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .toList();
        
        var routes = context.query().stream(
                of(Route.class)
                .joining(Route$.stops)
            )
            .filter(Route$.id.in(trips.stream().map(Trip::getRouteId).toList()))
            .collect(Collectors.toMap(Route::getId, Function.identity()));
        
        return context.query().stream(
                of(Trip.class)
                .joining(Trip$.driver)
                .joining(Trip$.riders)
                .joining(Trip$.payments)
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
