package com.uber.rides.ws;

import org.springframework.web.socket.WebSocketSession;

import com.uber.rides.model.User;

public class UserData {

    public long id;
    public WebSocketSession session;
    public static final User.Type type = null;

    public UserData(long id, WebSocketSession session) {
        this.id = id;
        this.session = session;
    }

    public UserData() {}

}