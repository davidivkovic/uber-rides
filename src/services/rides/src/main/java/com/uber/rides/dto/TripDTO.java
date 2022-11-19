package com.uber.rides.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

import com.uber.rides.model.Route;
import com.uber.rides.model.Trip;
import com.uber.rides.model.Trip.Status;
import com.uber.rides.dto.user.UserDTO;

@Getter
@Setter
public class TripDTO {

    Long id;

    UserDTO rider;
    UserDTO driver;
    Route route;
    
    List<UserDTO> passengers;

    Status status;
    LocalDateTime startedAt;
    
    boolean scheduled;
    LocalDateTime scheduledAt;

    boolean cancelled;
    String cancellationReason;

    LocalDateTime completedAt;

    double totalPrice;
    String currency;
    
}