package com.uber.rides.ws.rider;

import org.springframework.web.socket.WebSocketSession;

import com.uber.rides.model.Trip;
import com.uber.rides.model.User;
import com.uber.rides.ws.UserData;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RiderData extends UserData {

    public static final String ROLE = User.Roles.RIDER;

    public Trip currentTrip;

    public RiderData(User user, WebSocketSession session) {
        super(user, session);
    }
    
}