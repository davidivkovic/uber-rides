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

    @Getter
    @Setter
    public static class Location {

        @NotEmpty String placeId;
        @NotEmpty String address;
        @NotNull double longitude;
        @NotNull double latitude;
        @NotNull int order;

    }

    @NotBlank String name;
    @NotNull Location neBounds;
    @NotNull Location swBounds;
    @NotNull Location start;
    @NotEmpty List<Location> stops;
    
}