package com.uber.rides.ws;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.ConcurrentWebSocketSessionDecorator;

import com.uber.rides.dto.TripDTO;
import com.uber.rides.model.User;
import com.uber.rides.ws.shared.messages.out.SyncStatus;

import static com.uber.rides.util.Utils.*;

@Getter
@Setter
public abstract class UserData {

    static int waitForMilliseconds = 2000;
    static int bufferSizeBytes = 4096;

    public User user;
    public WebSocketSession session;
    public LocalDateTime connectedAt;
    public boolean isOnline = true;

    @Autowired public WS ws;

    protected UserData() {}

    protected UserData(User user, WebSocketSession session) {
        this.user = user;
        this.setSession(session);
    }

    public abstract String getRole();

    public void setSession(WebSocketSession session) {
        this.session = session != null 
            ? new ConcurrentWebSocketSessionDecorator(session, waitForMilliseconds, bufferSizeBytes)
            : null;
        if (session != null) {
            this.connectedAt = LocalDateTime.now();
        }
    }

    public void onConnected() {
        var trip = user.getCurrentTrip();
        ws.sendMessageToUser(
            user.getId(), 
            new SyncStatus(trip != null ? mapper.map(trip, TripDTO.class) : null, isOnline)
        );
    }

    public void onDisconnected() {}

}