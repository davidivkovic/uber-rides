package com.uber.rides.model;

import java.util.List;

import javax.persistence.Embeddable;
import javax.persistence.Entity;
import javax.persistence.Id;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Car {
 
    public enum Types {
        UBER_X,
        UBER_BLACK,
        UBER_GREEN
    }

    @Embeddable
    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    @Setter
    public static class Type { 
        private Types carType;
        private String name;
        private int seats;
        private double paymentMultiplier;
        private String description;
    }

    @Id
    String registration;
    String make;
    String model;
    short year;
    Type type;
    double rating;

    public static final List<Type> availableTypes = List.of(
        new Type(Types.UBER_X, "UberX", 4, 1, "Cheap rides, just for you"),
        new Type(Types.UBER_BLACK, "Uber Black", 4, 1.2, "Premium rides in luxury cars"),
        new Type(Types.UBER_GREEN, "Uber Green", 4, 0.95, "Eco-friendly rides")
    );

    public static Type getByType(Types type) {
        return availableTypes.stream().filter(t -> t.getCarType().equals(type)).findFirst().orElse(null);
    }
}