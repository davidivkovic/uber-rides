package com.uber.rides.model;

import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

import javax.persistence.Entity;

@Getter
@Setter
@Entity
public class UserUpdate {

    @Id
    long id;
    String firstName;
    String lastName;
    String email;
    String city;
    String phoneNumber;
    String profilePicture;
    LocalDateTime requestedAt;
    
    @OneToOne User user;
}