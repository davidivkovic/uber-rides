package com.uber.rides.model;

import java.time.LocalDateTime;

import javax.persistence.EntityManager;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.google.maps.model.Bounds;
import com.google.maps.model.DirectionsLeg;
import com.google.maps.model.DirectionsResult;
import com.google.maps.model.DirectionsRoute;
import com.google.maps.model.Distance;
import com.google.maps.model.Duration;
import com.google.maps.model.EncodedPolyline;
import com.google.maps.model.LatLng;
import com.speedment.jpastreamer.application.JPAStreamer;
import com.uber.rides.database.DbContext;
import com.uber.rides.dto.route.PreviewRouteResponse;
import com.uber.rides.model.Trip.Status;
import com.uber.rides.service.GoogleMaps;
import com.uber.rides.util.Utils.Result;
import com.uber.rides.ws.driver.DriverData;
import com.uber.rides.ws.rider.RiderData;

public class RouteTests {

    @Mock
    private GoogleMaps maps;

    @Mock
    EntityManager db;

    @Mock
    JPAStreamer query;

    @Mock
    private DbContext context;

    @InjectMocks
    @Spy
    private Route.Service service;

    DriverData driver;
    RiderData rider;

    String originPlaceId = "OriginId";
    String destinationPlaceId = "DestinationId";
    String[] waypointPlaceIds = new String[] { "waypoint-789" };
    boolean optimizeWaypoints = false;
    boolean optimizeCost = false;
    LocalDateTime scheduledAt = LocalDateTime.now().plusHours(2);

    DirectionsResult directionsResult;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        var user = new User();
        user.setId(1L);
        rider = new RiderData();
        rider.setUser(user);
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
        legDuration.inSeconds = 100;
        Distance legDistance = new Distance();
        legDistance.inMeters = 100;
        directionsLeg.duration = legDuration;
        directionsLeg.distance = legDistance;
        directionsRoute.legs = new DirectionsLeg[] { directionsLeg };
        directionsResult.routes = new DirectionsRoute[]{ directionsRoute };
        doReturn(false).when(service).hasOverlappingScheduledTrips(rider.getUser().getId(), scheduledAt);
        when(context.db()).thenReturn(db);
        when(context.query()).thenReturn(query);
    }

    @Test
    public void testPreviewRoute_noDirections_returnsError() {
        when(maps.getDirections(
            originPlaceId,
            destinationPlaceId,
            waypointPlaceIds,
            scheduledAt,
            optimizeWaypoints))
        .thenReturn(null);

        Result<PreviewRouteResponse> result = service.previewRoute(
            rider,
            originPlaceId,
            destinationPlaceId,
            waypointPlaceIds,
            optimizeWaypoints,
            optimizeCost,
            scheduledAt
        );

        // assert error message is correct
        assertFalse(result.success());
        assertEquals("Could not get directions for specified route. Please try again later.", result.error());
    }

    @Test
    public void testPreviewRoute_noRoutesInDirections_returnsError() {
        var directionsResult = new DirectionsResult();
        directionsResult.routes = new DirectionsRoute[0];

        when(maps.getDirections(
            originPlaceId,
            destinationPlaceId,
            waypointPlaceIds,
            scheduledAt,
            optimizeWaypoints))
        .thenReturn(directionsResult);

        Result<PreviewRouteResponse> result = service.previewRoute(
            rider,
            originPlaceId,
            destinationPlaceId,
            waypointPlaceIds,
            optimizeWaypoints,
            optimizeCost,
            scheduledAt
        );

        // assert error message is correct
        assertFalse(result.success());
        assertEquals("Could not get directions for specified route. Please try again later.", result.error());
    }

    @Test
    public void testPreviewRoute_hasARiderAndItNotScheduled_setsCurrentTrip() {
        when(maps.getDirections(
            originPlaceId,
            destinationPlaceId,
            waypointPlaceIds,
            null,
            false))
        .thenReturn(directionsResult);

        Result<PreviewRouteResponse> result = service.previewRoute(
            rider,
            originPlaceId,
            destinationPlaceId,
            waypointPlaceIds,
            false,
            optimizeCost,
            null
        );

        assertTrue(result.success());

        // assert rider has a current trip
        assertNotNull(rider.getUser().getCurrentTrip());
        assertEquals(Status.BUILDING, rider.getUser().getCurrentTrip().getStatus());

        // assert rider's trip data correct
        assertEquals(100, rider.getUser().getCurrentTrip().getDistanceInMeters());
        assertEquals(100, rider.getUser().getCurrentTrip().getDurationInSeconds());

    }

    @Test
    public void testPreviewRoute_hasARiderAndIsScheduled_setsScheudledTrip() {
        when(maps.getDirections(
            originPlaceId,
            destinationPlaceId,
            waypointPlaceIds,
            scheduledAt,
            false))
        .thenReturn(directionsResult);

        Result<PreviewRouteResponse> result = service.previewRoute(
            rider,
            originPlaceId,
            destinationPlaceId,
            waypointPlaceIds,
            false,
            optimizeCost,
            scheduledAt
        );

        assertTrue(result.success());

        // assert rider has a current trip
        assertNotNull(rider.getUser().getCurrentTrip());
        assertEquals(Status.BUILDING, rider.getUser().getCurrentTrip().getStatus());

        // assert rider's trip data correct
        assertEquals(100, rider.getUser().getCurrentTrip().getDistanceInMeters());
        assertEquals(100, rider.getUser().getCurrentTrip().getDurationInSeconds());

        // assert rider's trip is scheduled
        assertTrue(rider.getUser().getCurrentTrip().isScheduled());
        assertEquals(scheduledAt, rider.getUser().getCurrentTrip().getScheduledAt());
    }

    // proveri sta trabe da se proveri!!
    @Test
    public void testPreviewRoute_optimizeWaypoints_returnsBestRoute() {
        when(maps.getDirections(
            originPlaceId,
            destinationPlaceId,
            waypointPlaceIds,
            scheduledAt,
            true))
        .thenReturn(directionsResult);

        Result<PreviewRouteResponse> result = service.previewRoute(
            null,
            originPlaceId,
            destinationPlaceId,
            waypointPlaceIds,
            true,
            false,
            scheduledAt
        );

        assertTrue(result.success());

        var response = result.result();

        // assert route is correct
        assertEquals(100, response.getDistanceInMeters());
        assertEquals(100, response.getDurationInSeconds());
    }

    // proveri sta trabe da se proveri!!
    @Test
    public void testPreviewRoute_optimizeCost_returnsCheapestRoute() {
        when(maps.getDirections(
            originPlaceId,
            destinationPlaceId,
            waypointPlaceIds,
            scheduledAt,
            true))
        .thenReturn(directionsResult);

        
        Result<PreviewRouteResponse> result = service.previewRoute(
            null,
            originPlaceId,
            destinationPlaceId,
            waypointPlaceIds,
            true,
            true,
            scheduledAt
        );

        assertTrue(result.success());
        var response = result.result();

        // assert route is correct
        assertEquals(100, response.getDistanceInMeters());
        assertEquals(100, response.getDurationInSeconds());

    }
}