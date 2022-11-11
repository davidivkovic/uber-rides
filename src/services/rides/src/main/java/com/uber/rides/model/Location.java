package com.uber.rides.model;

import java.time.LocalDateTime;

import javax.persistence.Embeddable;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class Location {

    double longitude;
    double latitude;
    LocalDateTime timestamp;
    
}