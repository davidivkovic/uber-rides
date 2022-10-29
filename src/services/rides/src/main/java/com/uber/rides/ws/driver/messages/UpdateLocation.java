package com.uber.rides.ws.driver.messages;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uber.rides.model.User;
import com.uber.rides.ws.Message;
import com.uber.rides.ws.driver.DriverData;
import com.uber.rides.ws.rider.WSRider;

import static com.uber.rides.Utils.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class UpdateLocation implements Message<DriverData> {

    public static final String TYPE = "UPDATE_LOCATION";

    long driverId;
    double latitude;
    double longitude;

    @PersistenceContext EntityManager db;
    
    @Autowired WSRider wsRider;
    @Autowired TaskScheduler scheduler;
    @Autowired ScheduledTask task;

    @Override
    @Transactional
    public void handle(DriverData sender) {
        // wsRider.broadcast("Handled UPDATE_DRIVER_LOCATION");
        // var u = new User();
        // u.firstName = "David";
        // u.lastName = "Ivkovic";
        // db.persist(u);
        scheduler.scheduleAtFixedRate(() -> task.dostuff(sender), Duration.ofSeconds(2));
    }

}

@Service(UpdateLocation.TYPE + SCHEDULED)
class ScheduledTask {

    @Autowired WSRider wsRider;
    @PersistenceContext EntityManager db;

    @Transactional
    public void dostuff(DriverData sender) {
        wsRider.broadcast("Handled UPDATE_DRIVER_LOCATION");
        var u = new User();
        u.setFirstName("David");
        u.setLastName("Ivkovic");
        db.persist(u);
    }
}