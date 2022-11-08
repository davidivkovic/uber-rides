package com.uber.rides.ws;

import org.springframework.web.socket.WebSocketSession;

public class UserData {

    public long id;
    public WebSocketSession session;
    public static final String ROLE = null;

    public UserData(long id, WebSocketSession session) {
        this.id = id;
        this.session = session;
    }

    public UserData() {}

}