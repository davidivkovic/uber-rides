package com.uber.rides.ws.rider;

import java.util.List;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;

import com.google.maps.model.DirectionsResult;

import org.springframework.web.socket.WebSocketSession;

import com.uber.rides.model.Car;
import com.uber.rides.model.User;
import com.uber.rides.model.User.Roles;
import com.uber.rides.ws.UserData;

@Getter
@Setter
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
    
}