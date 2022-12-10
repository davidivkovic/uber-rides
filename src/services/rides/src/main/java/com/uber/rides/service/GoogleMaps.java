package com.uber.rides.service;

import static com.uber.rides.util.Utils.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.http.client.utils.URIBuilder;

import org.springframework.stereotype.Service;

import com.google.maps.DirectionsApi;
import com.google.maps.GeoApiContext;
import com.google.maps.model.DirectionsResult;
import com.google.maps.model.DirectionsRoute;
import com.google.maps.model.TravelMode;
import com.uber.rides.model.Location;
import com.uber.rides.model.Route;

@Service
public class GoogleMaps {

    private GoogleMaps() {}

    public static final String STYLE = "&style=feature:water%7Celement%3Ageometry%7Ccolor%3A0xe9e9e9%7Clightness%3A17&style=feature:landscape%7Celement%3Ageometry%7Ccolor%3A0xf5f5f5%7Clightness%3A20&style=feature:road.highway%7Celement%3Ageometry.fill%7Ccolor%3A0xffffff%7Clightness%3A17&style=feature:road.highway%7Celement%3Ageometry.stroke%7Ccolor%3A0xffffff%7Clightness%3A29%7Cweight%3A0.2&style=feature:road.arterial%7Celement%3Ageometry%7Ccolor%3A0xffffff%7Clightness%3A18&style=feature:road.local%7Celement%3Ageometry%7Ccolor%3A0xffffff%7Clightness%3A16&style=feature:poi%7Celement%3Ageometry%7Ccolor%3A0xf5f5f5%7Clightness%3A21&style=feature:poi.park%7Celement%3Ageometry%7Ccolor%3A0xdedede%7Clightness%3A21&style=feature:undefined%7Celement%3Alabels.text.stroke%7Cvisibility%3Aon%7Ccolor%3A0xffffff%7Clightness%3A16&style=feature:undefined%7Celement%3Alabels.text.fill%7Csaturation%3A36%7Ccolor%3A0x333333%7Clightness%3A40&style=feature:undefined%7Celement%3Alabels.icon%7Cvisibility%3Aoff&style=feature:transit%7Celement%3Ageometry%7Ccolor%3A0xf2f2f2%7Clightness%3A19&style=feature:administrative%7Celement%3Ageometry.fill%7Ccolor%3A0xfefefe%7Clightness%3A20&style=feature:administrative%7Celement%3Ageometry.stroke%7Ccolor%3A0xfefefe%7Clightness%3A17%7Cweight%3A1.2&style=feature:poi%7Celement%3Alabels%7Cvisibility%3Aoff&style=feature:transit%7Celement%3Alabels.icon%7Csaturation%3A-65&style=feature:transit.line%7Celement%3Ageometry.fill%7Ccolor%3A0x29b4e3%7Csaturation%3A-60%7Clightness%3A60&style=feature:transit.line%7Celement%3Ageometry.stroke%7Ccolor%3A0x29b4e3%7Csaturation%3A-60%7Clightness%3A60&style=feature:transit.station.airport%7Celement%3Ageometry.fill%7Ccolor%3A0xc9d4e3&style=feature:transit.station.rail%7Celement%3Alabels.text%7Csaturation%3A-40%7Clightness%3A5";
    public static final String STATIC_KEY = new String(Base64.getDecoder().decode(GM_KEY_STATIC), StandardCharsets.UTF_8);

    public static final GeoApiContext CONTEXT = new GeoApiContext.Builder()
        .apiKey(new String(Base64.getDecoder().decode(GM_KEY), StandardCharsets.UTF_8))
        .build();
        
    public DirectionsResult getDirections(
        String originPlaceId,
        String destinationPlaceId,
        String[] waypointPlaceIds,
        LocalDateTime scheduledAt,
        boolean optimizeWaypoints
    ) {
        var directionsRequest = DirectionsApi.newRequest(GoogleMaps.CONTEXT);
        
        if (scheduledAt == null) {
            directionsRequest = directionsRequest.departureTimeNow();
        }
        else {
            directionsRequest = directionsRequest.departureTime(scheduledAt.toInstant(ZoneOffset.UTC));
        }

        if (waypointPlaceIds.length > 0) {
            directionsRequest = directionsRequest.waypointsFromPlaceIds(waypointPlaceIds);
        }

        directionsRequest = directionsRequest
            .originPlaceId(originPlaceId)
            .destinationPlaceId(destinationPlaceId)
            .optimizeWaypoints(optimizeWaypoints)
            .alternatives(true)
            .mode(TravelMode.DRIVING);
        try {
            return directionsRequest.await();
        } 
        catch (Exception e) {
            return null;
        }
    }

    public DirectionsRoute getDirections(Route route) {
        var numberOfStops = route.getStops().size();
        var destination = route.getStops().get(numberOfStops - 1);
        var directionsRequest = DirectionsApi
            .newRequest(GoogleMaps.CONTEXT)
            .originPlaceId(route.getStart().getPlaceId());
        
        if (numberOfStops > 1) {
            directionsRequest = directionsRequest.waypointsFromPlaceIds(
                route
                .getStops()
                .stream()
                .limit(numberOfStops - 1L)
                .map(Location::getPlaceId)
                .toArray(String[]::new)
            );
        }

        directionsRequest = directionsRequest
            .destinationPlaceId(destination.getPlaceId())
            .departureTimeNow()
            .mode(TravelMode.DRIVING);
        try {
            return directionsRequest.await().routes[0];
        } 
        catch (Exception e) {
            return null;
        }
    }

    public byte[] getRouteThumbnail(DirectionsRoute directions) {
        try {
            var path = directions.overviewPolyline.getEncodedPath();
            var markers = Stream
                .of(directions.legs)
                .flatMap(l -> Stream.of(l.startLocation, l.endLocation))
                .distinct()
                .map(l -> String.format("%f,%f", l.lat, l.lng))
                .collect(Collectors.joining("|"));

            var url = new URIBuilder("https://maps.googleapis.com/maps/api/staticmap")
                .addParameter("size", "500x350")
                .addParameter("markers", "anchor:center|size:tiny|icon:https://i.imgur.com/WU5KngW.png|" + markers)
                .addParameter("path", "color:0x000000B3|weight:4|enc:" + path)
                .addParameter("key", STATIC_KEY)
                .toString() + GoogleMaps.STYLE;
        
            return HttpClient.newHttpClient().sendAsync(
                HttpRequest.newBuilder(new URI(url)).GET().build(),
                BodyHandlers.ofByteArray()
            )
            .thenApply(HttpResponse::body)
            .get();
        } 
        catch (Exception e) {
            return new byte[0];
        }
    }

}
