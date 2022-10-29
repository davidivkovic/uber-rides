package com.uber.rides.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Location {

    @Id
    @GeneratedValue
    private long id;
    private double longitude;
    private double latitude;
}
