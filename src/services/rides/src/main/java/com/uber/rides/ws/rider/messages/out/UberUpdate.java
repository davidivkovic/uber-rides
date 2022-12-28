package com.uber.rides.ws.rider.messages.out;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import com.uber.rides.ws.OutboundMessage;

@AllArgsConstructor
@NoArgsConstructor
public class UberUpdate implements OutboundMessage {

    public enum Status {
        LOOKING, FOUND, NO_DRIVERS, NO_ROUTE, PAYMENT_FAILED
    }

    public Status status;

    @Override
    public String messageType() { return "UBER_UPDATE"; }

}