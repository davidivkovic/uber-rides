package com.uber.rides.ws.driver.messages.out;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import com.google.maps.model.DirectionsResult;

import com.uber.rides.dto.TripDTO;
import com.uber.rides.ws.OutboundMessage;

@NoArgsConstructor
@AllArgsConstructor
public class TripAssigned implements OutboundMessage {

    public TripDTO trip;
    public DirectionsResult directions;

    @Override 
    public String messageType() { return "TRIP_ASSIGNED"; }

}
