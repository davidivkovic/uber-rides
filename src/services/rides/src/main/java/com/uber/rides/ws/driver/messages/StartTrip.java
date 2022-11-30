package com.uber.rides.ws.driver.messages;

import org.springframework.stereotype.Service;

import com.uber.rides.ws.Message;
import com.uber.rides.ws.driver.DriverData;

@Service
public class StartTrip implements Message<DriverData> {

    public static final String TYPE = "START_TRIP";

    @Override
    public void handle(DriverData sender) {
        /* Implement */
    }
}