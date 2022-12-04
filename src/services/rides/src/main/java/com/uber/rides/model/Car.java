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
 
    public enum Types {
        UBER_X,
        UBER_BLACK,
        UBER_GREEN
    }

    @Embeddable
    public static class Type { 
        public Types carType;
        public String name;
        public int seats;
        public double paymentMultiplier;
        public String description;

        public Type() {}
        
        public Type(Types type, String name, int seats, double paymentMultiplier, String description) {
            this.carType = type;
            this.name = name;
            this.seats = seats;
            this.paymentMultiplier = paymentMultiplier;
            this.description = description;
        }
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
        return availableTypes.stream().filter(t -> t.carType.equals(type)).findFirst().orElse(null);
    }
}