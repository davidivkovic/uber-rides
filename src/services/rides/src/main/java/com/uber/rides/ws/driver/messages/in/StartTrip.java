package com.uber.rides.ws.driver.messages.in;

import org.springframework.stereotype.Service;

import com.uber.rides.ws.InboundMessage;
import com.uber.rides.ws.driver.DriverData;

@Service
public class StartTrip implements InboundMessage<DriverData> {

    public static final String TYPE = "START_TRIP";

    @Override
    public void handle(DriverData sender) {
        /* Implement */
    }
}