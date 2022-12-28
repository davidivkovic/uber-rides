package com.uber.rides.ws;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.ConcurrentWebSocketSessionDecorator;

import com.uber.rides.model.User;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class UserData {

    static int waitForMilliseconds = 2000;
    static int bufferSizeBytes = 4096;

    public User user;
    public WebSocketSession session;

    @Autowired public WS ws;

    protected UserData(User user, WebSocketSession session) {
        this.user = user;
        this.setSession(session);
    }

    protected UserData() {}

    public void setSession(WebSocketSession session) {
        this.session = new ConcurrentWebSocketSessionDecorator(session, waitForMilliseconds, bufferSizeBytes);
    }

    public abstract String getRole();

    public void onConnected() {}

    public void onDisconnected() {}

}