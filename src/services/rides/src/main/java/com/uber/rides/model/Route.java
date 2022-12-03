package com.uber.rides.model;

import java.util.List;

import javax.persistence.ElementCollection;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OrderBy;

import com.uber.rides.controller.Routes;

import lombok.Getter;
import lombok.Setter;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@Getter
@Setter
@Entity
public class Route {
    
    @Id @GeneratedValue Long id;
    String name;
    String thumbnail;
    @Embedded Location start;
    @ElementCollection(fetch = FetchType.EAGER) @OrderBy("order") List<Location> stops;

    public String getThumbnail() {
        return linkTo(methodOn(Routes.class).getThumbnail(thumbnail)).toString();
    }

}