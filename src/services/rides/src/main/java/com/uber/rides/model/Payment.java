package com.uber.rides.model;

import java.time.LocalDateTime;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

import org.javamoney.moneta.FastMoney;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Payment {
    
    @Id String id;

    FastMoney money;
    String captureUrl;
    boolean captured;
    LocalDateTime capturedAt;

    @ManyToOne User user;
    @ManyToOne Trip trip;

}
