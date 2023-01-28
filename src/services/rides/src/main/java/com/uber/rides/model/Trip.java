package com.uber.rides.model;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Transient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import static com.speedment.jpastreamer.streamconfiguration.StreamConfiguration.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

import com.google.maps.model.DirectionsResult;
import com.google.maps.model.DirectionsRoute;

import com.uber.rides.util.GeoUtils;
import com.uber.rides.database.DbContext;
import com.uber.rides.dto.TripDTO;
import com.uber.rides.service.GoogleMaps;
import com.uber.rides.service.ImageStore;
import com.uber.rides.simulator.DriverSimulator;
import com.uber.rides.util.Utils.Result;
import com.uber.rides.ws.Store;
import com.uber.rides.ws.WS;
import com.uber.rides.ws.driver.DriverData;
import com.uber.rides.ws.driver.messages.out.TripAssigned;
import com.uber.rides.ws.driver.messages.out.TripCancelled;
import com.uber.rides.ws.driver.messages.out.TripStarted;
import com.uber.rides.ws.rider.RiderData;
import com.uber.rides.ws.rider.messages.out.TripReminder;
import com.uber.rides.ws.rider.messages.out.UberUpdate;

import static com.uber.rides.util.Utils.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Trip {

    // 1. REZERVISI SLOBODNOG VOZACA INTERNO
    // 2. PLATI U DVA KORAKA - SACUVAJ VOZNJU U BAZU - AKO DRUGI KORAK PLACANJA NE USPE OSLOBODI VOZACA
    // 3. NAREDI VOZACU TRENUTNU VOZNJU
    // 4. VOZAC DOLAZI NA PICKUP LOCACTION
    // 5. VOZAC ZAPOCINJE ILI OTKAZUJE VOZNJU UZ OPRAVDANJE

    public enum Status {
        BUILDING, CREATED, PAID, AWAITING_PICKUP, IN_PROGRESS, CANCELLED, COMPLETED, SCHEDULED
    }

    @Id @GeneratedValue Long id;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "driver_id") 
    User driver;

    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE}) 
    @JoinColumn(name = "route_id") 
    Route route;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id") 
    Car car;

    @ManyToMany @Builder.Default Set<User> riders = new HashSet<>();
    @OneToMany @Builder.Default List<Payment> payments = new ArrayList<>();
    @OneToMany @Builder.Default Set<Rating> ratings = new HashSet<>();

    Status status;
    LocalDateTime startedAt;
    
    boolean scheduled;
    LocalDateTime scheduledAt;

    boolean cancelled;
    String cancellationReason;

    LocalDateTime completedAt;

    boolean splitPayment;
    double totalPrice;
    String currency;

    double distanceInMeters;
    double durationInSeconds;

    @Transient
    DirectionsRoute directions;

    /* Navigation FK's */

    Long ownerId;

    @Column(name = "driver_id", insertable = false, updatable = false) 
    Long driverId;

    @Column(name = "route_id", insertable = false, updatable = false) 
    Long routeId;

    @Column(name = "car_id", insertable = false, updatable = false) 
    String carId;
    
    @org.springframework.stereotype.Service
    public static class Service {

        @Autowired DbContext context;
        @Autowired Store store;
        @Autowired ImageStore images;
        @Autowired GoogleMaps maps;
        @Autowired WS ws;
        @Autowired ThreadPoolTaskScheduler scheduler;
        @Autowired DriverSimulator simulator;
        

        public List<PaymentMethod> getPaymentMethods(List<Long> userIds) {
            return context.query()
                .stream(of(User.class).joining(User$.defaultPaymentMethod))
                .filter(User$.id.in(userIds))
                .map(User::getDefaultPaymentMethod)
                .toList();
        }


        public Result<List<Payment>> processPayments(Trip trip) {
            var payingRiderIds = trip.getRiders()
                .stream()
                .filter(rider -> trip.isSplitPayment() 
                    ? true
                    : rider.getId().equals(trip.getOwnerId()) 
                )
                .map(User::getId).toList();

            var payments = getPaymentMethods(payingRiderIds)
                .parallelStream()
                .map(m -> {
                    if (m == null) return null;
                    var payment = m.authorize(
                        trip.getTotalPrice() / (trip.isSplitPayment() ? payingRiderIds.size() : 1), 
                        "USD", 
                        trip.getDriver()
                    );
                    if (payment != null) context.db().persist(payment);
                    return payment;
                })
                .toList();
    
            if (payments.stream().anyMatch(Objects::isNull)) {
                var update = new UberUpdate(UberUpdate.Status.PAYMENT_FAILED);
                payments.parallelStream().filter(Objects::nonNull).forEach(Payment::refund);
                trip.setStatus(Trip.Status.CANCELLED);
                trip.getRiders().forEach(r -> ws.sendMessageToUser(r.getId(), update));
                return Result.error("Authorization failed. Please try again later.");
            } 
            else if(payments.parallelStream().map(Payment::capture).anyMatch(success -> !success)) {
                return Result.error("Payment failed. Please try again later.");
            }
            return Result.value(payments);
        }


        public void scheduleRide(Trip trip, DriverData driver) {
            DirectionsResult pickupDirections = null;
            synchronized (driver.getUser()) {
                if (driver.isAvailable()) {
                    driver.setAvailable(false);
                    driver.getUser().setCurrentTrip(null);
                }
            }   
            if (driver.getUser().getCurrentTrip() == null) {
                trip.setStatus(Status.AWAITING_PICKUP);
                driver.getUser().setCurrentTrip(trip);
                var start = trip.getRoute().getStart();
                pickupDirections = maps.getDirections(
                    driver.latitude, 
                    driver.longitude,  
                    start.getLatitude(),
                    start.getLongitude()
                );
                driver.setDirections(pickupDirections);
                simulator.runTask(driver.getUser(), pickupDirections.routes[0], false);
            }
            else {
                trip.setStatus(Status.SCHEDULED);
            }
            var tripAssigned = new TripAssigned(trip, pickupDirections);
            trip.getRiders().forEach(r -> ws.sendMessageToUser(r.getId(), tripAssigned)); // SEND, CHECK TRIP_STATUS ON FRONT
            ws.sendMessageToUser(driver.getUser().getId(), tripAssigned); // SEND, CHECK TRIP_STATUS ON FRONT
        }


        public DriverData getMatchingDriver(Trip trip) {
            return store
                .drivers
                .values()
                .stream()
                .filter(DriverData::isOnline)
                .filter(d -> d.getUser().getCar().getType().getCarType().equals(trip.getCar().getType().getCarType()))
                .filter(driverData -> {
                    if (trip.isScheduled()) {
                        return driverData.getUser().getScheduledTrips().stream().noneMatch(t -> 
                            t.getStatus() == Trip.Status.PAID && 
                            t.isScheduled() && 
                            t.getScheduledAt().compareTo(trip.getScheduledAt().plusSeconds((long)trip.getDurationInSeconds())) <= 0 &&
                            t.getScheduledAt().plusSeconds((long)t.getDurationInSeconds()).compareTo(trip.getScheduledAt()) >= 0
                        );
                    }
                    return driverData.isAvailable() && driverData.getUser().getCurrentTrip() == null;
                })
                .min(Comparator.comparing(
                    d -> GeoUtils.distance(
                        d.getLatitude(), d.getLongitude(),
                        trip.getRoute().getStart().getLatitude(), trip.getRoute().getStart().getLongitude()
                    )
                ))
                .orElse(null);
        }


        public Result<Void> orderRide(Trip trip) {

            trip.getRiders().forEach(r -> ws.sendMessageToUser(r.getId(), new UberUpdate(UberUpdate.Status.LOOKING)));
            var driver = getMatchingDriver(trip);
    
            if (driver == null) {
                return Result.error("No drivers available currently. Please try again later.");
            }
    
            if (!trip.isScheduled()) {    
                synchronized (driver) {
                    driver.setAvailable(false);
                }
            }
    
            trip.setStatus(Trip.Status.CREATED);
    
            var pickupDirections = maps.getDirections(
                driver.latitude, 
                driver.longitude,  
                trip.getRoute().getStart().getLatitude(),
                trip.getRoute().getStart().getLongitude()
            );
    
            if (pickupDirections == null) {
                driver.setAvailable(true);
                // trip.getRiders().forEach(r -> ws.sendMessageToUser(r.getId(), new UberUpdate(UberUpdate.Status.NO_ROUTE)));
                return Result.error("Could not find a route to the start of the trip.");
            }
    
            trip.setDriver(driver.getUser());
            trip.setCar(driver.getUser().getCar()); 
    
            var route = context.db().merge(trip.getRoute());
            trip.setRoute(route);
            trip.setRouteId(route.getId());
    
            context.db().persist(trip);
    
            trip.getRiders().forEach(r -> ws.sendMessageToUser(r.getId(), new UberUpdate(UberUpdate.Status.FOUND)));
    
            var payments = processPayments(trip);
            if (!payments.success()) return Result.error(payments);
    
            trip.setPayments(payments.result());
            trip.setStatus(Trip.Status.PAID);

    
            if (trip.isScheduled()) {
                driver.getUser().getScheduledTrips().add(trip);
                scheduler.schedule(() -> scheduleRide(trip, driver), trip.getScheduledAt().toInstant(ZoneOffset.UTC));
                var reminder = new TripReminder(
                    trip.getScheduledAt(), 
                    trip.getRoute().getStart().getAddress(), 
                    trip.getRoute().getStops().get(trip.getRoute().getStops().size() - 1).getAddress()
                );
                var now = LocalDateTime.now(ZoneOffset.UTC);
                for (int i = 1; i < 4; i++) {
                    var nextReminder = trip.getScheduledAt().minusMinutes(i * 5);
                    if (nextReminder.isBefore(now)) continue;
                    scheduler.schedule(
                        () -> trip.getRiders().forEach(r -> ws.sendMessageToUser(r.getId(), reminder)),
                        nextReminder.toInstant(ZoneOffset.UTC)
                    );
                }
            }
            else {
                trip.setStatus(Status.AWAITING_PICKUP);
                driver.getUser().setCurrentTrip(trip);
                driver.setDirections(pickupDirections);
                simulator.runTask(driver.getUser(), pickupDirections.routes[0], false);
            }
    
            var tripAssigned = new TripAssigned(trip, pickupDirections);
            trip.getRiders().forEach(r -> ws.sendMessageToUser(r.getId(), tripAssigned)); // SEND, CHECK TRIP_STATUS ON FRONT
            ws.sendMessageToUser(driver.getUser().getId(), tripAssigned); // SEND, CHECK TRIP_STATUS ON FRONT
            
            return Result.empty();

        }


        public Result<Trip> chooseRide(RiderData rider, Trip trip, Car.Types rideType) {
            
            var changeCar = trip.getCar() != null;
            trip.setTotalPrice(rider.getCarPricesInUsd().get(rideType));
            trip.setCar(Car.builder().type(Car.getByType(rideType)).build());
    
            if (changeCar) {
                return Result.value(trip);
            }
    
            var directionsRoute = rider.getDirections().routes[0];
            var thumbnail = maps.getRouteThumbnail(directionsRoute);
    
            if (thumbnail.length == 0) {
                return Result.error("Could not get route thumbnail at this time. Please try again later.");
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
    
            if (directionsRoute.legs.length == 1) { // Only origin and destination, no stops in between
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
    
            return Result.value(trip);
        }
    

        public Result<Void> startTrip(DriverData driver, Trip trip) {
    
            var start = trip.getRoute().getStart();
            var distance = GeoUtils.distance(
                driver.getLatitude(),
                driver.getLongitude(),
                start.getLatitude(),
                start.getLongitude()
            );
    
            if (distance > 50) {
                return Result.error("You are not in the right location to start the trip. Please move closer to the pickup location.");
            }
    
            var tripStarted = new TripStarted(mapper.map(trip, TripDTO.class));
            ws.sendMessageToUser(driver.getUser().getId(), tripStarted);
            trip.getRiders().forEach(rider -> ws.sendMessageToUser(rider.getId(), tripStarted));
            
            simulator.runTask(driver.getUser(), trip.getDirections(), true); // CHECK IF THERE IS SCHEDULED TRIP
            trip.setStatus(Trip.Status.IN_PROGRESS);
            trip.setStartedAt(LocalDateTime.now());
            context.db().merge(trip);
    
            return Result.empty();
        }
    

        public void cancelTrip(DriverData driver, Trip trip, String reason) {
    
            driver.getUser().setCurrentTrip(null);
            driver.setAvailable(true);
            driver.setDirections(null);
    
            simulator.runTask(driver.getUser());
    
            trip.setStatus(Trip.Status.CANCELLED);
            trip.getPayments().stream().filter(Objects::nonNull).forEach(Payment::refund);
    
            context.db().merge(trip);
    
            var tripCancelled = new TripCancelled(
                trip.getId(), 
                reason, 
                trip.getTotalPrice() / (trip.isSplitPayment() ? trip.getRiders().size() : 1)
            );
            trip.getRiders().forEach(rider -> {
                rider.setCurrentTrip(null);
                var riderData = store.riders.get(rider.getId());
                riderData.setDirections(null);
                riderData.setCarPricesInUsd(null);
                riderData.setInvitedPassengerIds(null);
                ws.sendMessageToUser(rider.getId(), tripCancelled);
            });
    
        }
    }
    
}
