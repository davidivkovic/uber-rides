package com.uber.rides.ws.driver.messages.in;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Comparator;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uber.rides.database.DbContext;
import com.uber.rides.model.Trip;
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
    @Autowired Trip.Service trips;

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
        trip.getRiders().forEach(r -> {
            r.setCurrentTrip(null);
            ws.sendMessageToUser(r.getId(), new TripEnded());
        });

        var nextTrip = trip.getDriver()
            .getScheduledTrips()
            .stream()
            .filter(t -> 
                t.getScheduledAt().isBefore(LocalDateTime.now(ZoneOffset.UTC).plusMinutes(15)) && 
                t.getScheduledAt().isAfter(trip.getStartedAt())
            )
            .sorted(Comparator.comparing(Trip::getScheduledAt))
            .findFirst()
            .orElse(null);
        
        if (nextTrip != null) {
            trips.scheduleRide(nextTrip, sender);
            // context.db().merge(nextTrip);
        }

    }
}