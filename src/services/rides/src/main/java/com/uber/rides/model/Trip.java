package com.uber.rides.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Column;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Trip {

    // 1. REZERVISI SLOBODNOG VOZACA INTERNO
    // 2. PLATI U DVA KORAKA - SACUVAJ VOZNJU U BAZU - AKO DRUGI KORAK PLACANJA NE USPE OSLOBODI VOZACA
    // 3. NAREDI VOZACU TRENUTNU VOZNJU
    // 4. VOZAC DOLAZI NA PICKUP LOCACTION
    // 5. VOZAC ZAPOCINJE ILI OTKAZUJE VOZNJU UZ OPRAVDANJE

    public enum Status {
        CREATED, PAID, AWAITING_PICKUP, IN_PROGRESS, CANCELLED, COMPLETED
    }

    @Id @GeneratedValue Long id;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "driver_id") 
    User driver;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "route_id") 
    Route route;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "car_id") 
    Car car;

    @ManyToMany Set<User> riders = new HashSet<>();
    @OneToMany List<Payment> payments = new ArrayList<>();

    Status status;
    LocalDateTime startedAt;
    
    boolean scheduled;
    LocalDateTime scheduledAt;

    boolean cancelled;
    String cancellationReason;

    LocalDateTime completedAt;

    double totalPrice;
    String currency;

    /* Navigation FK's */

    @Column(name = "driver_id", insertable = false, updatable = false) 
    Long driverId;

    @Column(name = "route_id", insertable = false, updatable = false) 
    Long routeId;

    @Column(name = "car_id", insertable = false, updatable = false) 
    String carId;
    
}
