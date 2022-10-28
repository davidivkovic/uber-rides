package com.uber.rides.ws.driver;

import org.springframework.web.socket.WebSocketSession;

import com.uber.rides.model.User;
import com.uber.rides.model.User.Type;
import com.uber.rides.ws.UserData;

public class DriverData extends UserData {

    public static final User.Type type = Type.DRIVER;

    public DriverData(long id, WebSocketSession session) {
        super(id, session);
    }
    
}