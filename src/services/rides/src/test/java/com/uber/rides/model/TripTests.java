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

    @Test
    public void testProcessPayments_authorizationFails_returnsError() {
        trip.setSplitPayment(false);
        
        var paymentMethod = mock(PaymentMethod.class);
        rider.getUser().setDefaultPaymentMethod(paymentMethod);

        when(paymentMethod.authorize(trip.getTotalPrice(), trip.getCurrency(), driver.getUser())).thenReturn(null);
        doReturn(Arrays.asList(paymentMethod)).when(service).getPaymentMethods(any());

        Result<List<Payment>> result = service.processPayments(trip);

        assertFalse(result.success());

        // assert correct error message was returned
        assertEquals( "Authorization failed. Please try again later.", result.error());

        // assert trip status cancelled
        assertEquals(Status.CANCELLED, trip.getStatus());

        // assert that the ws.sendMessageToUser method is called for each rider
        trip.getRiders().forEach(rider -> verify(ws).sendMessageToUser(eq(rider.getId()), any(UberUpdate.class)));

        // assert refund has been processed
        trip.getPayments().forEach(payment -> verify(payment).refund());
    }

    @Test
    public void testProcessPayments_noPaymentMethodsSet_returnsError() {
        trip.setSplitPayment(false);
        
        rider.getUser().setDefaultPaymentMethod(null);

        doReturn(Arrays.asList(rider.getUser().getDefaultPaymentMethod())).when(service).getPaymentMethods(any());

        Result<List<Payment>> result = service.processPayments(trip);

        assertFalse(result.success());

        // assert correct error message was returned
        assertEquals( "Authorization failed. Please try again later.", result.error());

        // assert trip status cancelled
        assertEquals(Status.CANCELLED, trip.getStatus());

        // assert that the ws.sendMessageToUser method is called for each rider
        trip.getRiders().forEach(rider -> verify(ws).sendMessageToUser(eq(rider.getId()), any(UberUpdate.class)));

        // assert refund has been processed
        trip.getPayments().forEach(payment -> verify(payment).refund());
    }
    
    @Test
    public void testProcessPayments_captureFails_returnsError() {
        trip.setSplitPayment(false);
        trip.setOwnerId(rider.getUser().getId());

        var payment = mock(Payment.class);
        var paymentMethod = mock(PaymentMethod.class);
        rider.getUser().setDefaultPaymentMethod(paymentMethod);

        when(paymentMethod.authorize(trip.getTotalPrice(), trip.getCurrency(), trip.getDriver())).thenReturn(payment);
        when(payment.capture()).thenReturn(false);

        doReturn(Arrays.asList(rider.getUser().getDefaultPaymentMethod())).when(service).getPaymentMethods(any());

        Result<List<Payment>> result = service.processPayments(trip);

        assertFalse(result.success());

        // assert correct error message was returned
        assertEquals("Payment failed. Please try again later.", result.error());
    }

    @Test
    public void testProcessPayments_authorizationAndCapturePass_returnsPayments() {
        trip.setSplitPayment(true);

        trip.setDriver(driver.getUser());

        var anotherRider = new User();
        anotherRider.setId(3L);

        var payment = mock(Payment.class);
        var paymentMethod = mock(PaymentMethod.class);

        var anotherPayment = mock(Payment.class);
        var anotherPaymentMethod = mock(PaymentMethod.class);

        rider.getUser().setDefaultPaymentMethod(paymentMethod);
        anotherRider.setDefaultPaymentMethod(anotherPaymentMethod);

        when(paymentMethod.authorize(trip.getTotalPrice() / 2, trip.getCurrency(), trip.getDriver())).thenReturn(payment);
        when(payment.capture()).thenReturn(true);

        when(anotherPaymentMethod.authorize(trip.getTotalPrice() / 2, trip.getCurrency(), trip.getDriver())).thenReturn(anotherPayment);
        when(anotherPayment.capture()).thenReturn(true);

        doReturn(Arrays.asList(rider.getUser().getDefaultPaymentMethod(), anotherRider.getDefaultPaymentMethod())).when(service).getPaymentMethods(any());

        trip.setRiders(new HashSet<>(Arrays.asList(rider.getUser(), anotherRider)));

        Result<List<Payment>> result = service.processPayments(trip);

        assertTrue(result.success());

        assertEquals(2, result.result().size());

        // assert both payments captured
        verify(payment, times(1)).capture();
        verify(anotherPayment, times(1)).capture();

        // assert no messages sent to users
        verify(ws, never()).sendMessageToUser(any(), any(UberUpdate.class));
    }

    @Test
    public void testGetMatchingDrivers_noDriversOnline_returnNull() {
        driver.setOnline(false);

        DriverData driver = service.getMatchingDriver(trip);

        assertNull(driver);

    }

    @Test
    public void testGetMatchingDrivers_noDriversHaveMatchingCarType_retrnNull() {
        driver.setOnline(true);
        
        // set different car type
        var tripCar = new Car();
        tripCar.setType(Car.getByType(Types.UBER_GREEN));
        trip.setCar(tripCar);

        DriverData driver = service.getMatchingDriver(trip);

        assertNull(driver);
    }

    @Test
    public void testGetMatchingDrivers_onlineDriversHaveCurrentTrip_returnNull() {
        driver.setOnline(true);

        // set current trip for the driver
        driver.getUser().setCurrentTrip(new Trip());

        DriverData driver = service.getMatchingDriver(trip);

        assertNull(driver);
    }

    @Test
    public void testGetMatchingDrivers_forScheduledTripAndNoDriversFree_returnsNull() {
        driver.setOnline(true);
        
        var scheduledAt = LocalDateTime.now().plusHours(1);
        // set trip to be scheduled
        trip.setScheduled(true);
        trip.setScheduledAt(scheduledAt);

        // set a scheduled trip for the driver at the same time
        var driversScheduledTrip = new Trip();
        driversScheduledTrip.setScheduled(true);
        driversScheduledTrip.setStatus(Status.PAID);
        driversScheduledTrip.setDurationInSeconds(1000000000);
        driversScheduledTrip.setScheduledAt(scheduledAt);
        driver.getUser().setScheduledTrips(new ArrayList<>());
        driver.getUser().scheduledTrips.add(driversScheduledTrip);

        DriverData foundDriver = service.getMatchingDriver(trip);

        assertNull(foundDriver);
    }

    @Test
    public void testGetMatchingDrivers_forScheduledTripAndDriverFree_returnDriver() {
        driver.setOnline(true);
        
        // set trip to be scheduled
        trip.setScheduled(true);
        trip.setScheduledAt(LocalDateTime.now().plusHours(3));

        // set a scheduled trip for the driver
        var driversScheduledTrip = new Trip();
        driversScheduledTrip.setScheduled(true);
        driversScheduledTrip.setScheduledAt(LocalDateTime.now().plusHours(1));
        driver.getUser().setScheduledTrips(new ArrayList<>());
        driver.getUser().scheduledTrips.add(driversScheduledTrip);

        DriverData driver = service.getMatchingDriver(trip);

        assertNotNull(driver);
    }

    @Test
    @SuppressWarnings(UNCHECKED)
    public void testGetPaymentMethods_validUserIds_returnsListOfPaymentMethods() {
        reset(service);

        var paymentMethod1 = new PaymentMethod();
        var paymentMethod2 = new PaymentMethod();
        var paymentMethod3 = new PaymentMethod();

        var user1 = new User();
        user1.setId(1L);
        var user2 = new User();
        user2.setId(2L);
        var user3 = new User();
        user3.setId(3L);

        user1.setDefaultPaymentMethod(paymentMethod1);
        user2.setDefaultPaymentMethod(paymentMethod2);
        user3.setDefaultPaymentMethod(paymentMethod3);
        
        var userIds = Arrays.asList(1L, 2L, 3L);

        when(context.query().stream(any(StreamConfiguration.class))).thenReturn(Stream.of(user1, user2, user3));

        List<PaymentMethod> result = service.getPaymentMethods(userIds);

        // assert list size 3
        assertEquals(3, result.size());
    }

    @Test
    @SuppressWarnings(UNCHECKED)
    public void testGetPaymentMethods_emptyUserIds_returnsEmptyList() {
        reset(service);

        var userIds = new ArrayList<Long>();

        when(context.query().stream(any(StreamConfiguration.class))).thenReturn(Stream.empty());

        List<PaymentMethod> result = service.getPaymentMethods(userIds);

        // assert empty list
        assertEquals(0, result.size());
        
    }
}