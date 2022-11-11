package com.uber.rides.model;

import java.util.List;

import javax.persistence.Embeddable;
import javax.persistence.Entity;
import javax.persistence.Id;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Car {

    @Embeddable
    public record Type(
        String name,
        byte seats,
        double paymentMultiplier,
        String description
    ) { }

    @Id
    String registration;
    String make;
    String model;
    short year;
    Type type;

    static final List<Type> availableTypes = List.of(
        new Type("UberX", (byte) 4, 1, "Cheap rides, just for you"),
        new Type("Uber Black", (byte) 4, 1.2, "Premium rides in luxury cars"),
        new Type("Uber Green", (byte) 4, 0.95, "Eco-friendly rides")
    );

}