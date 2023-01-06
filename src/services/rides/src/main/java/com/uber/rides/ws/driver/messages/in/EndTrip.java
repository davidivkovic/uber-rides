package com.uber.rides.ws.driver.messages.in;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uber.rides.database.DbContext;
import com.uber.rides.model.Trip.Status;
import com.uber.rides.ws.InboundMessage;
import com.uber.rides.ws.Store;
import com.uber.rides.ws.WS;
import com.uber.rides.ws.driver.DriverData;
import com.uber.rides.ws.driver.messages.out.TripEnded;

@Service
public class EndTrip implements InboundMessage<DriverData> {

    public static final String TYPE = "END_TRIP";

    @Autowired DbContext context;
    @Autowired Store store;
    @Autowired WS ws;

    @Override
    @Transactional
    public void handle(DriverData sender) {
        var trip = sender.getUser().getCurrentTrip();
        if (trip == null) return;

        sender.setAvailable(true);
        sender.getUser().setCurrentTrip(null);
        
        trip.setStatus(Status.COMPLETED);
        context.db().merge(trip);

        ws.sendMessageToUser(trip.getDriver().getId(), new TripEnded());
        trip.getRiders().forEach(r -> ws.sendMessageToUser(r.getId(), new TripEnded()));
    }
}