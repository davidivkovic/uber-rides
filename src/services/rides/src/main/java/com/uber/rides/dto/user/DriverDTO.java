package com.uber.rides.dto.user;

import com.uber.rides.dto.TripDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DriverDTO extends UserDTO {

    TripDTO currentTrip;
    
}