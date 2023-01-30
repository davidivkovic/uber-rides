package com.uber.rides.ws.driver;

import java.time.LocalDateTime;

import javax.persistence.EntityManagerFactory;
import javax.transaction.Transactional;

import lombok.Getter;
import lombok.Setter;

import com.google.maps.model.DirectionsResult;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.WebSocketSession;

import com.uber.rides.model.User;
import com.uber.rides.model.User.Roles;
import com.uber.rides.ws.UserData;
import com.uber.rides.ws.driver.messages.out.Fatigue;

@Getter
@Setter
public class DriverData extends UserData {

    public double latitude;
    public double longitude;
    public double duration;
    public double distance;
    public double heading;
    public boolean isAvailable = true;
    public LocalDateTime lastSeenAt;
    public int updateCounter = 0;
    public DirectionsResult directions;

    @Autowired EntityManagerFactory dbFactory;

    public DriverData(User user, WebSocketSession session) {
        super(user, session);
    }

    @Override
    public void onConnected() {
        if (user.isFatigued()) {
            super.setOnline(false);
        }
        super.onConnected();
        if (user.isFatigued() && user.hasFatigueEnded()) {
            user.resetFatigue();
            persistUser();
        }
        sendFatigueMessage();
    }
    
    @Override
    @Transactional
    public void onDisconnected() {
        super.onDisconnected();
        persistUser();
    }

    @Override
    public String getRole() {
        return Roles.DRIVER;
    }

    @Override
    public void setOnline(boolean isOnline) {
        if (!isOnline) {
            setLatitude(0);
            setLongitude(0);
        }
        if (user.isFatigued()) {
            super.setOnline(false);
        }
        else {
            super.setOnline(isOnline);
        }
    }

    
    public void updateFatigue() {
        updateCounter++;
        if (isOnline && !user.isFatigued()) {
            user.addFatigue(5);
        }
        if (updateCounter % 12 != 0) return; // Every minute
        if (user.isFatigued()) {
            if (user.hasFatigueEnded()) {
                user.resetFatigue();
                persistUser();
            }
            else {
                setOnline(false);
            }
        } 
        sendFatigueMessage();
        if (updateCounter % 180 == 0) { // Every 15 minutes
            updateCounter = 0;
            persistUser();
        }
    }

    public void sendFatigueMessage() {
        ws.sendMessageToUser(
            user.getId(), 
            new Fatigue(
                user.isFatigued(),
                user.getMinutesFatigue(),
                user.getFatigueEnd()
            )
        );
    }

    public void persistUser() {
        try {
            var db = dbFactory.createEntityManager();
            db.getTransaction().begin();
            db.merge(user);
            db.flush();
            db.getTransaction().commit();
            db.close();
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }
    
}