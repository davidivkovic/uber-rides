package com.uber.rides.model;

import java.time.LocalDate;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Card {
    @Id @GeneratedValue Long id;

    private String cardNumber;
    private String cvv;
    private LocalDate expirationDate;
    private String nickname; 
    private String country;
}
