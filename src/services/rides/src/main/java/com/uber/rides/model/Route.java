package com.uber.rides.model;

import java.util.List;

import javax.persistence.ElementCollection;
import javax.persistence.Embeddable;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class Route {
    
    Location start;
    @ElementCollection List<Location> stops;

}