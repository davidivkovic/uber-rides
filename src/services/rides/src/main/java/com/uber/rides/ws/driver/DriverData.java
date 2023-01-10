package com.uber.rides.ws.driver;

import lombok.Getter;
import lombok.Setter;

import com.google.maps.model.DirectionsResult;

import java.time.LocalDateTime;

import org.springframework.web.socket.WebSocketSession;

import com.uber.rides.model.User;
import com.uber.rides.model.User.Roles;
import com.uber.rides.ws.UserData;

@Getter
@Setter
public class DriverData extends UserData {

    public double latitude;
    public double longitude;
    public double duration;
    public double distance;
    public double heading;
    public boolean isAvailable = true;
    public DirectionsResult directions;
    public int minutesFatigue = 0;
    public LocalDateTime fatigueStart = LocalDateTime.now();

    public DriverData(User user, WebSocketSession session) {
        super(user, session);
    }

    @Override
    public String getRole() {
        return Roles.DRIVER;
    }
    
    @Override
    public void onDisconnected() {
        // setLatitude(0);
        // setLongitude(0); // move this logic to when the driver offline
        super.onDisconnected();
    }
}