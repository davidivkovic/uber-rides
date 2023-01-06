package com.uber.rides.ws.driver.messages.in;

import org.springframework.stereotype.Service;

import com.uber.rides.ws.InboundMessage;
import com.uber.rides.ws.driver.DriverData;

@Service
public class Online implements InboundMessage<DriverData> {

    public static final String TYPE = "ONLINE";

    public boolean isOnline;

    @Override
    public void handle(DriverData sender) {
        sender.setOnline(isOnline);
    }
}