package com.uber.rides.ws.rider;

import java.util.List;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;

import org.springframework.web.socket.WebSocketSession;

import com.google.maps.model.DirectionsResult;
import com.uber.rides.model.Car;
import com.uber.rides.model.Route;
import com.uber.rides.model.Trip;
import com.uber.rides.model.User;
import com.uber.rides.model.User.Roles;
import com.uber.rides.ws.UserData;

@Getter
@Setter
public class RiderData extends UserData {

    Trip currentTrip;
    DirectionsResult directions;
    Map<Car.Types, Double> carPricesInUsd;
    Route route;

    public RiderData(User user, WebSocketSession session) {
        super(user, session);
    }

    @Override
    public String getRole() {
        return Roles.RIDER;
    }
    
}