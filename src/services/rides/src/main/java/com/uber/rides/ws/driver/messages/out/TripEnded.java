package com.uber.rides.ws.driver.messages.out;

import com.uber.rides.ws.OutboundMessage;

public class TripEnded implements OutboundMessage {

    @Override 
    public String messageType() { return "TRIP_ENDED"; }

}