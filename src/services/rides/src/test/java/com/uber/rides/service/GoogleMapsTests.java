package com.uber.rides.service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

import org.apache.commons.lang3.SystemUtils;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.mockito.Mockito.*;

import com.google.maps.DirectionsApi;
import com.google.maps.model.DirectionsLeg;
import com.google.maps.model.DirectionsResult;
import com.google.maps.model.DirectionsRoute;
import com.google.maps.model.EncodedPolyline;
import com.google.maps.model.LatLng;
import com.google.maps.model.TravelMode;

import com.uber.rides.model.Location;
import com.uber.rides.model.Route;
import com.uber.rides.service.GoogleMaps.APIClient;

public class GoogleMapsTests {
    @Mock
    APIClient client;

    @InjectMocks
    private GoogleMaps googleMaps;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        googleMaps.setAPIClient(client);
    }

    @Test
    public void testGetDirections() {
        var originalLat = 1.0;
        var originalLng = 2.0;
        var destionationLat = 3.0;
        var destinationLng = 4.0;
        var directionsRequest = DirectionsApi.newRequest(GoogleMaps.CONTEXT)
            .origin(new LatLng(originalLat, originalLng))
            .destination(new LatLng(destionationLat, destinationLng))
            .mode(TravelMode.DRIVING);

        googleMaps.getDirections(originalLat, originalLng, destionationLat, destinationLng);
        verify(client).sendRequest(refEq(directionsRequest));
    }

    @Test
    public void testGetDirections_withDepartureTimeNow() {
        var directionsRequest = DirectionsApi.newRequest(GoogleMaps.CONTEXT)
            .departureTimeNow()
            .originPlaceId("originPlaceId")
            .destinationPlaceId("destinationPlaceId")
            .optimizeWaypoints(false)
            .alternatives(true)
            .mode(TravelMode.DRIVING);

        LocalDateTime scheduledAt = null;
        googleMaps.getDirections("originPlaceId", "destinationPlaceId", new String[] {}, scheduledAt, false);

        verify(client).sendRequest(refEq(directionsRequest));
    }

    @Test
    public void testGetDirections_withScheduledDeparture() {
        var waypoints = new String[] { "waypoint1", "waypoint2" };
        LocalDateTime scheduledAt = LocalDateTime.now().plusHours(3);
        var directionsRequest = DirectionsApi.newRequest(GoogleMaps.CONTEXT)
            .originPlaceId("originPlaceId")
            .destinationPlaceId("destinationPlaceId")
            .optimizeWaypoints(false)
            .alternatives(true)
            .mode(TravelMode.DRIVING)
            .departureTime(scheduledAt.toInstant(ZoneOffset.UTC))
            .waypointsFromPlaceIds(waypoints);

        googleMaps.getDirections("originPlaceId", "destinationPlaceId", waypoints, scheduledAt, false);

        verify(client).sendRequest(refEq(directionsRequest, "waypoints"));
    }

    @Test
    public void testGetDirections_withWaypoints() {
        LocalDateTime scheduledAt = LocalDateTime.now().plusHours(3);
        var directionsRequest = DirectionsApi.newRequest(GoogleMaps.CONTEXT)
            .originPlaceId("originPlaceId")
            .destinationPlaceId("destinationPlaceId")
            .optimizeWaypoints(false)
            .alternatives(true)
            .mode(TravelMode.DRIVING)
            .departureTime(scheduledAt.toInstant(ZoneOffset.UTC));

        googleMaps.getDirections("originPlaceId", "destinationPlaceId", new String[] {}, scheduledAt, false);

        
        verify(client).sendRequest(refEq(directionsRequest));

    }

    @Test
    public void testGetDirectionsWithRoute_originAndDestination() {
        var start = new Location();
        start.setPlaceId("StartLocationId");
        var destination = new Location();
        destination.setPlaceId("DestinationLocationId");

        var route = new Route();
        route.setStart(start);
        route.setStops(List.of(destination));

        var directionsRequest = DirectionsApi.newRequest(GoogleMaps.CONTEXT)
                .originPlaceId(start.getPlaceId())
                .destinationPlaceId(destination.getPlaceId())
                .departureTimeNow()
                .mode(TravelMode.DRIVING);

        var directionsRoute = new DirectionsResult();
        directionsRoute.routes = new DirectionsRoute[] { new DirectionsRoute() };
        when(client.sendRequest(refEq(directionsRequest))).thenReturn(directionsRoute);

        var response = googleMaps.getDirections(route);

        verify(client).sendRequest(refEq(directionsRequest));
        assertEquals(response, directionsRoute.routes[0]);
    }

    @Test
    public void testGetDirectionsWithRoute_atLeastOneStop() {
        var start = new Location();
        start.setPlaceId("StartLocationId");
        var stop = new Location();
        stop.setPlaceId("StopLocationId");
        var destination = new Location();
        destination.setPlaceId("DestinationLocationId");

        var route = new Route();
        route.setStart(start);
        route.setStops(List.of(stop, destination));

        var directionsRequest = DirectionsApi.newRequest(GoogleMaps.CONTEXT)
                .originPlaceId(start.getPlaceId())
                .destinationPlaceId(destination.getPlaceId())
                .departureTimeNow()
                .mode(TravelMode.DRIVING)
                .waypointsFromPlaceIds(
                        route
                                .getStops()
                                .stream()
                                .limit(1)
                                .map(Location::getPlaceId)
                                .toArray(String[]::new));

        googleMaps.getDirections(route);

        verify(client).sendRequest(refEq(directionsRequest, "waypoints"));
    }

    @Test
    public void testGetRouteThumbnail_returnsThumbnail() throws Exception {
        DirectionsRoute directions = new DirectionsRoute();
        directions.overviewPolyline = new EncodedPolyline(
                "gptwFpltbMdAeDy@i@oDaCqFmDaOuJ{MyIQM`@sAhCgI`AyCzBxAa@lA_@nA");

        DirectionsLeg leg1 = new DirectionsLeg();
        leg1.startAddress = "315 W 18th St, New York, NY 10011, USA";
        leg1.endAddress = "221 W 29th St, New York, NY 10001, USA";
        LatLng startLocation = new LatLng();
        startLocation.lat = 40.742605;
        startLocation.lng = -74.001531;
        leg1.startLocation = startLocation;
        LatLng endLocation = new LatLng();
        endLocation.lat = 40.748195;
        endLocation.lng = -73.993709;
        leg1.endLocation = endLocation;
        directions.legs = new DirectionsLeg[] { leg1 };
         
        String expectedUrl = SystemUtils.IS_OS_LINUX ? "https://maps.googleapis.com/maps/api/staticmap?size=500x350&markers=anchor%3Acenter%7Csize%3Atiny%7Cicon%3Ahttps%3A%2F%2Fi.imgur.com%2FWU5KngW.png%7C40.742605%2C-74.001531%7C40.748195%2C-73.993709&path=color%3A0x000000B3%7Cweight%3A4%7Cenc%3AgptwFpltbMdAeDy%40i%40oDaCqFmDaOuJ%7BMyIQM%60%40sAhCgI%60AyCzBxAa%40lA_%40nA&key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&style=feature:water%7Celement%3Ageometry%7Ccolor%3A0xe9e9e9%7Clightness%3A17&style=feature:landscape%7Celement%3Ageometry%7Ccolor%3A0xf5f5f5%7Clightness%3A20&style=feature:road.highway%7Celement%3Ageometry.fill%7Ccolor%3A0xffffff%7Clightness%3A17&style=feature:road.highway%7Celement%3Ageometry.stroke%7Ccolor%3A0xffffff%7Clightness%3A29%7Cweight%3A0.2&style=feature:road.arterial%7Celement%3Ageometry%7Ccolor%3A0xffffff%7Clightness%3A18&style=feature:road.local%7Celement%3Ageometry%7Ccolor%3A0xffffff%7Clightness%3A16&style=feature:poi%7Celement%3Ageometry%7Ccolor%3A0xf5f5f5%7Clightness%3A21&style=feature:poi.park%7Celement%3Ageometry%7Ccolor%3A0xdedede%7Clightness%3A21&style=feature:undefined%7Celement%3Alabels.text.stroke%7Cvisibility%3Aon%7Ccolor%3A0xffffff%7Clightness%3A16&style=feature:undefined%7Celement%3Alabels.text.fill%7Csaturation%3A36%7Ccolor%3A0x333333%7Clightness%3A40&style=feature:undefined%7Celement%3Alabels.icon%7Cvisibility%3Aoff&style=feature:transit%7Celement%3Ageometry%7Ccolor%3A0xf2f2f2%7Clightness%3A19&style=feature:administrative%7Celement%3Ageometry.fill%7Ccolor%3A0xfefefe%7Clightness%3A20&style=feature:administrative%7Celement%3Ageometry.stroke%7Ccolor%3A0xfefefe%7Clightness%3A17%7Cweight%3A1.2&style=feature:poi%7Celement%3Alabels%7Cvisibility%3Aoff&style=feature:transit%7Celement%3Alabels.icon%7Csaturation%3A-65&style=feature:transit.line%7Celement%3Ageometry.fill%7Ccolor%3A0x29b4e3%7Csaturation%3A-60%7Clightness%3A60&style=feature:transit.line%7Celement%3Ageometry.stroke%7Ccolor%3A0x29b4e3%7Csaturation%3A-60%7Clightness%3A60&style=feature:transit.station.airport%7Celement%3Ageometry.fill%7Ccolor%3A0xc9d4e3&style=feature:transit.station.rail%7Celement%3Alabels.text%7Csaturation%3A-40%7Clightness%3A5" : "https://maps.googleapis.com/maps/api/staticmap?size=500x350&markers=anchor%3Acenter%7Csize%3Atiny%7Cicon%3Ahttps%3A%2F%2Fi.imgur.com%2FWU5KngW.png%7C40%2C742605%2C-74%2C001531%7C40%2C748195%2C-73%2C993709&path=color%3A0x000000B3%7Cweight%3A4%7Cenc%3AgptwFpltbMdAeDy%40i%40oDaCqFmDaOuJ%7BMyIQM%60%40sAhCgI%60AyCzBxAa%40lA_%40nA&key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&style=feature:water%7Celement%3Ageometry%7Ccolor%3A0xe9e9e9%7Clightness%3A17&style=feature:landscape%7Celement%3Ageometry%7Ccolor%3A0xf5f5f5%7Clightness%3A20&style=feature:road.highway%7Celement%3Ageometry.fill%7Ccolor%3A0xffffff%7Clightness%3A17&style=feature:road.highway%7Celement%3Ageometry.stroke%7Ccolor%3A0xffffff%7Clightness%3A29%7Cweight%3A0.2&style=feature:road.arterial%7Celement%3Ageometry%7Ccolor%3A0xffffff%7Clightness%3A18&style=feature:road.local%7Celement%3Ageometry%7Ccolor%3A0xffffff%7Clightness%3A16&style=feature:poi%7Celement%3Ageometry%7Ccolor%3A0xf5f5f5%7Clightness%3A21&style=feature:poi.park%7Celement%3Ageometry%7Ccolor%3A0xdedede%7Clightness%3A21&style=feature:undefined%7Celement%3Alabels.text.stroke%7Cvisibility%3Aon%7Ccolor%3A0xffffff%7Clightness%3A16&style=feature:undefined%7Celement%3Alabels.text.fill%7Csaturation%3A36%7Ccolor%3A0x333333%7Clightness%3A40&style=feature:undefined%7Celement%3Alabels.icon%7Cvisibility%3Aoff&style=feature:transit%7Celement%3Ageometry%7Ccolor%3A0xf2f2f2%7Clightness%3A19&style=feature:administrative%7Celement%3Ageometry.fill%7Ccolor%3A0xfefefe%7Clightness%3A20&style=feature:administrative%7Celement%3Ageometry.stroke%7Ccolor%3A0xfefefe%7Clightness%3A17%7Cweight%3A1.2&style=feature:poi%7Celement%3Alabels%7Cvisibility%3Aoff&style=feature:transit%7Celement%3Alabels.icon%7Csaturation%3A-65&style=feature:transit.line%7Celement%3Ageometry.fill%7Ccolor%3A0x29b4e3%7Csaturation%3A-60%7Clightness%3A60&style=feature:transit.line%7Celement%3Ageometry.stroke%7Ccolor%3A0x29b4e3%7Csaturation%3A-60%7Clightness%3A60&style=feature:transit.station.airport%7Celement%3Ageometry.fill%7Ccolor%3A0xc9d4e3&style=feature:transit.station.rail%7Celement%3Alabels.text%7Csaturation%3A-40%7Clightness%3A5";

        when(client.sendGetRequest(expectedUrl)).thenReturn(new byte[] {});

        googleMaps.getRouteThumbnail(directions);
        verify(client).sendGetRequest(expectedUrl);

    }
}