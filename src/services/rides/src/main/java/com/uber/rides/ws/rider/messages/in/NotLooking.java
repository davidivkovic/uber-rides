package com.uber.rides.ws.rider.messages.in;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uber.rides.ws.InboundMessage;
import com.uber.rides.ws.WS;
import com.uber.rides.ws.rider.RiderData;
import com.uber.rides.ws.rider.messages.out.UberUpdate;

@Service
public class NotLooking implements InboundMessage<RiderData> {

    public static final String TYPE = "NOT_LOOKING";

    @Autowired WS ws;

    @Override
    public void handle(RiderData sender) {
        var trip = sender.getUser().getCurrentTrip();
        if (trip == null) return;
        trip.getRiders().forEach(r -> 
            ws.sendMessageToUser(r.getId(), new UberUpdate(UberUpdate.Status.NOT_LOOKING))
        );

    }
}