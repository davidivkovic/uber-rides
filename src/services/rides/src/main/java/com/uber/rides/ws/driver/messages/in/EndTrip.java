package com.uber.rides.ws.driver.messages.in;

import com.uber.rides.ws.InboundMessage;
import com.uber.rides.ws.driver.DriverData;

public class EndTrip implements InboundMessage<DriverData> {

    public static final String TYPE = "END_TRIP";

    @Override
    public void handle(DriverData sender) {
        /* Implement */
    }
}