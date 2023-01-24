package com.uber.rides.ws.driver.messages.out;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import com.uber.rides.ws.OutboundMessage;

@NoArgsConstructor
@AllArgsConstructor
public class TripCancelled implements OutboundMessage {
    
    public Long tripId;
    public String reason;
    public double refundAmount;

    @Override 
    public String messageType() { return "TRIP_CANCELLED"; }
    
}