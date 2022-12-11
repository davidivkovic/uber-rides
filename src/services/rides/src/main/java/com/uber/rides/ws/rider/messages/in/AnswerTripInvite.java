package com.uber.rides.ws.rider.messages.in;

import java.util.Map.Entry;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uber.rides.ws.InboundMessage;
import com.uber.rides.ws.Store;
import com.uber.rides.ws.WS;
import com.uber.rides.ws.rider.RiderData;
import com.uber.rides.ws.rider.messages.out.TripInviteUpdate;
import com.uber.rides.ws.rider.messages.out.TripInviteUpdate.Status;

@Service
public class AnswerTripInvite implements InboundMessage<RiderData> {

    public static final String TYPE = "ANSWER_TRIP_INVITE";

    public Long inviterId;
    public boolean accepted;

    @Autowired WS ws;
    @Autowired Store store;

    @Override
    public void handle(RiderData sender) {
        var inviterData = store.riders.get(inviterId);
        if (inviterData == null) return; // add some message handling
        
        var trip = inviterData.getCurrentTrip();
        if (trip == null) return; // add some message handling

        if (!inviterData.getInvitedPassengerIds().contains(sender.getUser().getId())) {
            return;
        }

        if (accepted) {
            trip.getRiders().add(sender.user);
        }

        var carPrices = inviterData
            .getCarPricesInUsd()
            .entrySet()
            .stream()
            .collect(Collectors
                .toMap(
                    Entry::getKey,
                    e -> e.getValue() / trip.getRiders().size()
                )
            );

        for (var passenger : trip.getRiders()) {
            ws.sendMessageToUser(
                passenger.getId(),
                new TripInviteUpdate(
                    sender.user.getId(), 
                    accepted ? Status.ACCEPTED : Status.DECLINED,
                    carPrices
                )
            );
        }
    }
    
}