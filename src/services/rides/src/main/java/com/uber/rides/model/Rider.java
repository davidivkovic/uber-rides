package com.uber.rides.model;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Rider extends User {

    //TODO: payment information
    //TODO: favorite routes

    private boolean isBlocked;

}
