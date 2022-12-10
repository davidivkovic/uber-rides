package com.uber.rides.ws.rider.messages.out;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.uber.rides.ws.OutboundMessage;

@NoArgsConstructor
@AllArgsConstructor
public class TripInviteUpdate implements OutboundMessage {

    public enum Status {
        ACCEPTED,
        DECLINED,
        REMOVED
    }
    
    public Long passengerId;
    public Status status;

    @Override
    public String type() { return "TRIP_INVITE_UPDATE"; }

}
