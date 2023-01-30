package com.uber.rides.ws.admin;

import org.springframework.web.socket.WebSocketSession;

import com.uber.rides.model.User;
import com.uber.rides.model.User.Roles;
import com.uber.rides.ws.UserData;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminData extends UserData {

    public AdminData(User user, WebSocketSession session) {
        super(user, session);
    }

    @Override
    public String getRole() {
        return Roles.ADMIN;
    }

    @Override
    public void onConnected() {
        setOnline(true);
        super.onConnected();
    }
    
}