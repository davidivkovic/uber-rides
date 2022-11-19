package com.uber.rides.model;

import java.util.List;

import javax.persistence.ElementCollection;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OrderBy;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Route {
    
    @Id @GeneratedValue Long id;
    String name;
    @Embedded Location start;
    @ElementCollection(fetch = FetchType.EAGER) @OrderBy("order") List<Location> stops;

}