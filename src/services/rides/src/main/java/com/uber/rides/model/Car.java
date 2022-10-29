package com.uber.rides.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Car {
    // TODO: type for price calculation

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;
    private String model;
    private String make;
    private int year;
    private String platesNumber;
    private int numberOfSeats;
    @OneToOne(mappedBy = "car")
    private Driver driver;

}
