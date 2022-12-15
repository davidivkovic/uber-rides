package com.uber.rides.model;

import java.util.List;
import java.util.Map;

import javax.persistence.Embeddable;
import javax.persistence.Entity;
import javax.persistence.Id;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
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
        Types carType;
        String name;
        int seats;
        double paymentMultiplier;
        String description;
        String image;
    }

    @Id
    String registration;
    String make;
    String model;
    short year;
    Type type;
    double rating;

    static final Map<Types, Type> types = Map.of(
        Types.UBER_X, new Type(
            Types.UBER_X,
            "UberX",
            4, 
            1, 
            "Cheap rides, just for you", 
            "https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/UberX_v1.png"
        ),
        Types.UBER_BLACK, new Type(
            Types.UBER_BLACK, 
            "Uber Black", 
            4, 
            1.65, 
            "Premium rides in luxury cars", 
            "https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/Black_v1.png"
        ),
        Types.UBER_GREEN, new Type(
            Types.UBER_GREEN,
            "Uber Green", 
            4, 
            1.15, 
            "Eco-friendly rides", 
            "https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/UberX_Green.png"
        )
    );

    static final List<Type> typesCollection = types .values()
        .stream()
        .sorted((c1, c2) -> Double.compare(c1.paymentMultiplier, c2.paymentMultiplier))
        .toList();

    public static List<Type> getAvailableTypes() {
        return typesCollection;
    }

    public static Type getByType(Types type) {
        if (type == null) return null;
        return types.get(type);
    }
}