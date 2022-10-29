package com.uber.rides.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
public class User {

    public enum Type {
        ADMIN,
        DRIVER,
        RIDER
    }

    @Id
    @GeneratedValue
    private long id;
    private Type type;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String city;
    private String phoneNumber;
}