package com.uber.rides.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    public enum Type {
        ADMIN,
        DRIVER,
        RIDER
    }

    @Id
    @GeneratedValue
    public long id;
    public Type type;
    public String firstName;
    public String lastName;
}