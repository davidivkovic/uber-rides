package com.uber.rides.ws.driver.messages.in;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uber.rides.model.Trip;
import com.uber.rides.ws.InboundMessage;
import com.uber.rides.ws.driver.DriverData;

@Service
public class StartTrip implements InboundMessage<DriverData> {

    public static final String TYPE = "START_TRIP";

    @Autowired Trip.Service trips;

    @Override
    @Transactional
    public void handle(DriverData sender) {
        if (sender.isSim) {
            trips.startTrip(sender, sender.getUser().getCurrentTrip());
        }
    }
}