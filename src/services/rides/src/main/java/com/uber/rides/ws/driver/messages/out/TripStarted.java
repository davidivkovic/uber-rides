package com.uber.rides.ws.driver.messages.out;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import com.uber.rides.dto.TripDTO;
import com.uber.rides.ws.OutboundMessage;

@NoArgsConstructor
@AllArgsConstructor
public class TripStarted implements OutboundMessage {
    
    public TripDTO trip;

    @Override 
    public String messageType() { return "TRIP_STARTED"; }
    
}