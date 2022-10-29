package com.uber.rides.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Pickup {
    @Id
    @GeneratedValue
    private long id;
    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;
    @ManyToOne
    @JoinColumn(name = "rider_id", nullable = false)
    private Rider rider;
    @ManyToOne
    @JoinColumn(name = "ride_id", nullable = false)
    private Ride ride;
}
