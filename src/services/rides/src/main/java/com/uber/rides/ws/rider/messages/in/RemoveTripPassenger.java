package com.uber.rides.ws.rider.messages.in;

import java.util.Map.Entry;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uber.rides.dto.user.UserDTO;
import com.uber.rides.model.User;
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

        var trip = sender.getUser().getCurrentTrip();
        if (trip == null) return; // add some message handling
    
        var passengers = Stream.concat(
            sender.getInvitedPassengerIds().stream(),
            trip.getRiders().stream().map(User::getId)
        )
        .distinct()
        .toList();

        var carPrices = sender
            .getCarPricesInUsd()
            .entrySet()
            .stream()
            .collect(Collectors
                .toMap(
                    Entry::getKey,
                    e -> e.getValue() / Math.max(1, (passengers.size() - 1))
                )
            );

        for (var passenger : passengers) {
            ws.sendMessageToUser(
                passenger,
                new TripInviteUpdate(
                    UserDTO.builder().id(passengerId).build(),
                    Status.REMOVED,
                    carPrices
                )
            );
        }

        trip.getRiders().removeIf(r -> r.getId().equals(passengerId));
        sender.getInvitedPassengerIds().removeIf(id -> id.equals(passengerId));

    }

}
