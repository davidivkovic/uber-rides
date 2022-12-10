package com.uber.rides.ws.rider.messages.out;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.uber.rides.dto.TripDTO;
import com.uber.rides.dto.user.UserDTO;
import com.uber.rides.ws.OutboundMessage;

@NoArgsConstructor
@AllArgsConstructor
public class TripInvite implements OutboundMessage {
    
    public UserDTO inviter;
    public TripDTO trip;

    @Override
    public String type() { return "TRIP_INVITE"; }

}