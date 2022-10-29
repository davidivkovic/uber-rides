package com.uber.rides.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class Driver extends User {

    private boolean isActive;
    private boolean isBlocked;
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "car_id", referencedColumnName = "id")
    private Car car;
    @OneToMany(mappedBy = "driver")
    private List<Ride> rides;
}
