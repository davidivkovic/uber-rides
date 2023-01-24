package com.uber.rides.ws.rider.messages.out;

import java.time.LocalDateTime;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.uber.rides.ws.OutboundMessage;

@NoArgsConstructor
@AllArgsConstructor
public class TripReminder implements OutboundMessage {
    
    public LocalDateTime startTime;
    public String source;
    public String destination;

    @Override
    public String messageType() { return "TRIP_REMINDER"; }

}