package com.uber.rides.ws.rider.messages.in;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uber.rides.ws.InboundMessage;
import com.uber.rides.ws.Store;
import com.uber.rides.ws.WS;
import com.uber.rides.ws.rider.RiderData;
import com.uber.rides.ws.rider.messages.out.TripInviteUpdate;
import com.uber.rides.ws.rider.messages.out.TripInviteUpdate.Status;

@Service
public class RemoveTripPassenger implements InboundMessage<RiderData> {
    
    public static final String TYPE = "REMOVE_TRIP_PASSENGER";

    public Long passengerId;

    @Autowired WS ws;
    @Autowired Store store;

    @Override
    public void handle(RiderData sender) {

        var trip = sender.getCurrentTrip();
        if (trip == null) return; // add some message handling
        
        var riders = trip.getRiders();
        riders.removeIf(r -> r.getId().equals(passengerId));

        for (var passenger : riders) {
            ws.sendMessageToUser(
                passenger.getId(),
                new TripInviteUpdate(
                    passengerId,
                    Status.REMOVED
                )
            );
        }

        ws.sendMessageToUser(
            passengerId,
            new TripInviteUpdate(
                passengerId,
                Status.REMOVED
            )
        );

    }

}
