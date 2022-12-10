package com.uber.rides.ws;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import com.uber.rides.model.User;
import com.uber.rides.model.User.Roles;
import com.uber.rides.ws.admin.AdminData;
import com.uber.rides.ws.driver.DriverData;
import com.uber.rides.ws.rider.RiderData;

@Component
public class Store {
    
    public Map<Long, DriverData> drivers = new ConcurrentHashMap<>();
    public Map<Long, RiderData> riders = new ConcurrentHashMap<>();
    public Map<Long, AdminData> admins = new ConcurrentHashMap<>();

    public Map<Long, Map<Long, ? extends UserData>> index = new ConcurrentHashMap<>();

    public void put(User user, WebSocketSession session) {
        switch (user.getRole()) {
            case Roles.ADMIN -> {
                admins.put(user.getId(), new AdminData(user, session));
                index.put(user.getId(), admins);
            }
            case Roles.DRIVER -> {
                drivers.put(user.getId(), new DriverData(user, session));
                index.put(user.getId(), drivers);
            }
            default -> {
                riders.put(user.getId(), new RiderData(user, session));
                index.put(user.getId(), riders);
            }
        }
    }

    public UserData get(Long id) {
        var map = index.get(id); 
        if (map == null) return null;
        return map.get(id);
    }

    public void remove(Long id) {
        var map = index.get(id); 
        if (map != null) map.remove(id);
        index.remove(id);
    }

    public Map<Long, ? extends UserData> getMap(String role) { //NOSONAR
        return switch (role) {
            case Roles.ADMIN -> admins;
            case Roles.DRIVER -> drivers;
            default -> riders;
        };
    }
    
}
