package com.uber.rides.ws.rider;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.google.maps.model.DirectionsResult;

import org.springframework.web.socket.WebSocketSession;

import com.uber.rides.model.Trip;
import com.uber.rides.dto.user.UserDTO;
import com.uber.rides.model.Car;
import com.uber.rides.model.User;
import com.uber.rides.model.User.Roles;
import com.uber.rides.ws.UserData;
import com.uber.rides.ws.rider.messages.out.TripInviteUpdate;

@Getter
@Setter
@NoArgsConstructor
public class RiderData extends UserData {

    DirectionsResult directions;
    Map<Car.Types, Double> carPricesInUsd;
    List<Long> invitedPassengerIds;

    public RiderData(User user, WebSocketSession session) {
        super(user, session);
    }

    @Override
    public String getRole() {
        return Roles.RIDER;
    }

    @Override
    public void onConnected() {
        setOnline(true);
        super.onConnected();
    }

    @Override
    public void onDisconnected() {
        if (user.getCurrentTrip() != null 
            && (user.getCurrentTrip().getStatus() == Trip.Status.BUILDING || 
                user.getCurrentTrip().getStatus() == Trip.Status.CANCELLED 
            )) {
            var isOwner = user.getCurrentTrip().getOwnerId().equals(user.getId());
            user.getCurrentTrip().getRiders().forEach(rider -> {
                ws.sendMessageToUser(
                    rider.getId(),
                    new TripInviteUpdate(
                        UserDTO.builder().id(isOwner ? rider.getId() : user.getId()).build(),
                        TripInviteUpdate.Status.REMOVED,
                        new HashMap<>()
                    )
                );
                if (isOwner) rider.setCurrentTrip(null);
            });
            user.setCurrentTrip(null);
        }
        super.onDisconnected();
    }
    
}