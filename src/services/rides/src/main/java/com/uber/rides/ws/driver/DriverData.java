package com.uber.rides.ws.driver;

import lombok.Getter;
import lombok.Setter;

import com.google.maps.model.DirectionsResult;

import org.springframework.web.socket.WebSocketSession;

import com.uber.rides.model.User;
import com.uber.rides.model.User.Roles;
import com.uber.rides.ws.UserData;
import com.uber.rides.ws.rider.messages.out.CarLocation;

@Getter
@Setter
public class DriverData extends UserData {

    public double latitude;
    public double longitude;
    public double heading;
    public boolean isAvailable = true;
    public boolean isOnline = true;
    public DirectionsResult directions;

    public DriverData(User user, WebSocketSession session) {
        super(user, session);
    }

    @Override
    public String getRole() {
        return Roles.DRIVER;
    }
    
    @Override
    public void onDisconnected() {
        this.ws.broadcast(
            Roles.RIDER,
            new CarLocation(this.user.getCar().getRegistration())
        );
    }
}