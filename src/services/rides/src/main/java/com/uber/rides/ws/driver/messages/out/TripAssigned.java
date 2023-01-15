package com.uber.rides.ws.driver.messages.out;

import java.util.stream.Stream;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import com.google.maps.model.DirectionsResult;

import com.uber.rides.dto.TripDTO;
import com.uber.rides.model.Trip;
import com.uber.rides.ws.OutboundMessage;

import static com.uber.rides.util.Utils.*;

@NoArgsConstructor
@AllArgsConstructor
public class TripAssigned implements OutboundMessage {

    public TripDTO trip;
    public DirectionsResult directions;
    public double driverDuration;
    public double driverDistance;

    public TripAssigned(Trip trip, DirectionsResult directions) {
        this.trip = mapper.map(trip, TripDTO.class);
        this.directions = directions;
        if (directions == null) return;
        this.driverDistance = Stream
            .of(directions.routes[0].legs)
            .mapToLong(leg -> leg.distance.inMeters)
            .sum();
        this.driverDuration = Stream
            .of(directions.routes[0].legs)
            .mapToLong(leg -> leg.duration.inSeconds)
            .sum();
    }

    @Override 
    public String messageType() { return "TRIP_ASSIGNED"; }

}
