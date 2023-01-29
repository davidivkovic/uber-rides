package com.uber.rides.ws.driver.messages.in;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.uber.rides.ws.InboundMessage;
import com.uber.rides.ws.driver.DriverData;

@Service
public class ConfirmTrip implements InboundMessage<DriverData> {

    public static final String TYPE = "CONFIRM_TRIP";

    @Override
    @Transactional
    public void handle(DriverData sender) {
        /* Implement */
    }
}