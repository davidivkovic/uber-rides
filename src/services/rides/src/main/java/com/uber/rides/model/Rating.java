package com.uber.rides.model;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Rating {
    
    int carRating;
    int driverRating;
    String comment;
    boolean completed;
    LocalDateTime completableBy;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "user_id") 
    User user;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "trip_id") 
    Trip trip;

    /* Navigation FK's */

    @Column(name = "user_id", insertable = false, updatable = false) 
    Long userId;

    @Column(name = "trip_id", insertable = false, updatable = false) 
    Long tripId;
}