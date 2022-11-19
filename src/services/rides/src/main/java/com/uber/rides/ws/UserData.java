package com.uber.rides.ws;

import org.springframework.web.socket.WebSocketSession;

import com.uber.rides.model.User;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserData {

    public User user;
    public WebSocketSession session;
    public static final String ROLE = null;

    public UserData(User user, WebSocketSession session) {
        this.user = user;
        this.session = session;
    }

    public UserData() {}

}