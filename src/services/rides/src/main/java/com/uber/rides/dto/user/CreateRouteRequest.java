package com.uber.rides.dto.user;

import java.util.List;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateRouteRequest {

    public class Location {

        @NotNull double longitude;
        @NotNull double latitude;

    }

    @NotBlank String name;
    @NotNull Location start;
    @NotEmpty List<Location> stops;
    
}