package com.uber.rides.ws.rider;

import org.springframework.web.socket.WebSocketSession;

import com.uber.rides.model.User;
import com.uber.rides.model.User.Type;
import com.uber.rides.ws.UserData;

public class RiderData extends UserData {

    public static final User.Type type = Type.RIDER;

    public RiderData(long id, WebSocketSession session) {
        super(id, session);
    }
    
}