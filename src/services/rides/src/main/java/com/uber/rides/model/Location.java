package com.uber.rides.model;

import java.time.LocalDateTime;

import javax.persistence.Embeddable;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class Location {

    String placeId;
    String address;
    double longitude;
    double latitude;
    LocalDateTime timestamp;
    int order;

    public Location(String address, double longitude, double latitude, int order) {
        this.address = address;
        this.longitude = longitude;
        this.latitude = latitude;
        this.order = order;
    }
    
}