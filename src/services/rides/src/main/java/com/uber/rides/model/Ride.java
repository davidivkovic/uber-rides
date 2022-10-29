package com.uber.rides.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
public class Ride {
    public enum RideStatus {
        PENDING, STARTED, COMPLETED, REJECTED, MISSED
    }

    @Id
    @GeneratedValue
    private long id;
    private LocalDateTime orderDateTime;
    private LocalDateTime startDateTime;
    private RideStatus status;
    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;
    @OneToMany(mappedBy = "ride")
    private List<Pickup> pickups;
}
