package com.uber.rides.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import javax.persistence.EntityManager;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;

import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

import com.speedment.jpastreamer.application.JPAStreamer;
import com.speedment.jpastreamer.streamconfiguration.StreamConfiguration;

import com.google.maps.model.Bounds;
import com.google.maps.model.DirectionsLeg;
import com.google.maps.model.DirectionsResult;
import com.google.maps.model.DirectionsRoute;
import com.google.maps.model.Distance;
import com.google.maps.model.Duration;
import com.google.maps.model.EncodedPolyline;
import com.google.maps.model.LatLng;

import com.uber.rides.database.DbContext;
import com.uber.rides.model.Car.Types;
import com.uber.rides.model.Trip.Status;
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
import com.uber.rides.ws.rider.messages.out.UberUpdate;

import static com.uber.rides.util.Utils.UNCHECKED;

public class TripTests {
    @Mock
    EntityManager db;

    @Mock
    JPAStreamer query;

    @Mock
    private DbContext context;

    @Mock
    private Store store;
    
    @Mock
    private ImageStore images;

    @Mock
    private GoogleMaps maps;

    @Mock
    private WS ws;

    @Mock
    private ThreadPoolTaskScheduler scheduler;

    @Mock
    private DriverSimulator simulator;

    @InjectMocks
    @Spy
    private Trip.Service service;

    Trip trip;
    Route route;
    DriverData driver;
    RiderData rider;
    DirectionsResult directionsResult;
    Car car;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        
        // db mocks
        doNothing().when(db).persist(any());
        when(context.db()).thenReturn(db);
        when(context.query()).thenReturn(query);

        // trip with route data
        trip = new Trip();
        route = new Route();
        route.setStart(new Location("", 1,1, 0));
        route.setStops(List.of(new Location("", 2,2, 1)));
        trip.setRoute(route);

        // dirver data
        driver = new DriverData();
        driver.setUser(new User());
        driver.getUser().setId(1L);
        driver.setOnline(true);

        // rider data
        rider = new RiderData();
        rider.setUser(new User());
        rider.getUser().setId(2L);
        rider.setCarPricesInUsd(Map.of(Car.Types.UBER_X, 10.0));
        rider.getUser().setDefaultPaymentMethod(new PaymentMethod());
        trip.setRiders(new HashSet<>(Arrays.asList(rider.getUser())));
        trip.setOwnerId(rider.getUser().getId());

        // driver's car data
        car = new Car();
        car.setType(Car.getByType(Types.UBER_X));
        driver.getUser().setCar(car);
        trip.setCar(car);

        // trip price data
        trip.setTotalPrice(10);
        trip.setCurrency("USD");
       
        // set active driver
        store.drivers = new HashMap<>();
        store.drivers.put(driver.getUser().getId(), driver);

        // set active rider
        store.riders = new HashMap<>();
        store.riders.put(rider.getUser().getId(), rider);

        // google maps directions
        directionsResult = new DirectionsResult();
        DirectionsRoute directionsRoute = new DirectionsRoute();
        directionsRoute.bounds = new Bounds();
        directionsRoute.overviewPolyline = new EncodedPolyline("Encoded points");
        directionsRoute.bounds.northeast = new com.google.maps.model.LatLng(1, 1);
        directionsRoute.bounds.southwest = new com.google.maps.model.LatLng(1, 1);
        DirectionsLeg directionsLeg = new DirectionsLeg();
        directionsLeg.startLocation = new LatLng(1, 1);
        directionsLeg.startAddress = "Origin";
        directionsLeg.endLocation = new LatLng(2, 2);
        directionsLeg.endAddress = "Destination";
        Duration legDuration = new Duration();
        legDuration.inSeconds = 1;
        Distance legDistance = new Distance();
        legDistance.inMeters = 1;
        directionsLeg.duration = legDuration;
        directionsLeg.distance = legDistance;
        directionsRoute.legs = new DirectionsLeg[] { directionsLeg };
        directionsResult.routes = new DirectionsRoute[]{ directionsRoute };
        rider.setDirections(directionsResult);
    }

    @Test
    public void testScheduleRide_driverIsAvailable_setPickup() {
        driver.setAvailable(true);
        when(maps.getDirections(
            driver.getLatitude(), 
            driver.getLongitude(),
            trip.getRoute().getStart().getLatitude(), 
            trip.getRoute().getStart().getLongitude()))
        .thenReturn(directionsResult);

        // call the method under test
        service.scheduleRide(trip, driver);

        // assert that the driver is no longer available
        assertFalse(driver.isAvailable());

        // assert that the trip's status is set to AWAITING_PICKUP
        assertEquals(Status.AWAITING_PICKUP, trip.getStatus());

        // assert that the driver's current trip is set to the input trip
        assertEquals(trip, driver.getUser().getCurrentTrip());

        // assert that the driver's directions are set to the result of the maps.getDirections method
        assertEquals(directionsResult, driver.getDirections());

        // assert that the simulator.runTask method is called
        verify(simulator).runTask(driver.getUser(), directionsResult.routes[0], false);

        // assert that the ws.sendMessageToUser method is called for each rider
        trip.getRiders().forEach(rider -> verify(ws).sendMessageToUser(eq(rider.getId()), any(TripAssigned.class)));

        // assert that the ws.sendMessageToUser method is called for the driver
        verify(ws).sendMessageToUser(eq(driver.getUser().getId()), any(TripAssigned.class));
    }

    @Test
    public void testScheduleRide_driverIsNotAvailable_returnsError() {
        when(maps.getDirections(
            driver.getLatitude(), 
            driver.getLongitude(),
            trip.getRoute().getStart().getLatitude(), 
            trip.getRoute().getStart().getLongitude()))
        .thenReturn(directionsResult);

        driver.setAvailable(false);
        driver.getUser().setCurrentTrip(new Trip());

        // call the method under test
        service.scheduleRide(trip, driver);

        // assert that the trip's status is set to SCHEDULED
        assertEquals(Status.SCHEDULED, trip.getStatus());

        // assert that the ws.sendMessageToUser method is called for each rider
        trip.getRiders().forEach(rider -> verify(ws).sendMessageToUser(eq(rider.getId()), any(TripAssigned.class)));

        // assert that the ws.sendMessageToUser method is called for the driver
        verify(ws).sendMessageToUser(eq(driver.getUser().getId()), any(TripAssigned.class));

        //  assert simulator.runTask is not called
        verify(simulator, never()).runTask(any(), any(), anyBoolean());
    }

    @Test
    public void testOrderRide_noDriverAvailable_returnsError() {
        driver.setOnline(false);
        Result<Void> result = service.orderRide(trip);

        assertFalse(result.success());
        assertEquals("No drivers available currently. Please try again later.", result.error());
    }

    @Test
    public void testOrderRide_pickupDirectionsNull_returnError() {
        // unable to find diretions to pickup location
        when(maps.getDirections(anyDouble(), anyDouble(), anyDouble(), anyDouble())).thenReturn(null);

        // call the orderRide() method
        Result<Void> result = service.orderRide(trip);

        assertFalse(result.success());
        assertEquals("Could not find a route to the start of the trip.", result.error());

        // assert that the driver is still available
        assertTrue(driver.isAvailable());
    }

    @Test
    public void testOrderRide_driverNotAvailable_returnsError() {
        // unable to find diretions to pickup location
        when(maps.getDirections(anyDouble(), anyDouble(), anyDouble(), anyDouble())).thenReturn(directionsResult);

        // set the driver to not available
        driver.setAvailable(false);

        // call the orderRide() method
        Result<Void> result = service.orderRide(trip);

        assertFalse(result.success());
        assertEquals("No drivers available currently. Please try again later.", result.error());

        // assert that the driver is still available
        assertFalse(driver.isAvailable());
    }

}