package com.uber.rides.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Rating {

    @Id
    @GeneratedValue
    private long id;
    private int score;
    private String comment;
    private LocalDateTime dateTime;
    @ManyToOne
    @JoinColumn(name = "ride_id", nullable = false)
    private Ride ride;
    @ManyToOne
    @JoinColumn(name = "rider_id", nullable = false)
    private Rider rider;
}
