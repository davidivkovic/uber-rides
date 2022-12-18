package com.uber.rides.model;

import java.time.LocalDate;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Card implements Payment.Method {
    
    public static final String TYPE = "CARD";
    
    @Id @GeneratedValue Long id;
    String cardNumber;
    String cvv;
    LocalDate expirationDate;
    String nickname; 
    String country;

    public boolean authorize(double amount, String currency) {
        return true;
    }

    public boolean capture(String token) {
        return true;
    }

    public boolean cancel(String token) {
        return true;
    }
    
}
