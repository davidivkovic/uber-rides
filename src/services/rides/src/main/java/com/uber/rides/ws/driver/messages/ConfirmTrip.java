package com.uber.rides.ws.driver.messages;

import com.uber.rides.ws.Message;
import com.uber.rides.ws.driver.DriverData;

public class ConfirmTrip implements Message<DriverData> {

    public static final String TYPE = "CONFIRM_TRIP";

    @Override
    public void handle(DriverData sender) {
        
    }
}