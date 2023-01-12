package com.uber.rides.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Rating {
    
    @Id @GeneratedValue Long id;
    
    double rating;
    String comment;

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

    public Rating(Trip trip, User user, double rating, String comment) {
        this.trip = trip;
        this.user = user;
        this.rating = rating;
        this.comment = comment;
    }
    
}