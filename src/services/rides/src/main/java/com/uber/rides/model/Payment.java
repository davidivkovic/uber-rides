package com.uber.rides.model;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Payment {

    @Id
    String id;

    String captureUrl;
    boolean captured;
    LocalDateTime capturedAt;
    double amount;
    String currency;

    @ManyToOne(fetch = FetchType.LAZY) PaymentMethod method;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    User user;
    @Column(name = "user_id", insertable = false, updatable = false)
    Long userId;

}