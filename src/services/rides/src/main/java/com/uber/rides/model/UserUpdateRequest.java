package com.uber.rides.model;

import java.time.LocalDateTime;

import javax.persistence.Id;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;

import lombok.Getter;
import lombok.Setter;

import static com.uber.rides.Utils.mapper;

@Getter
@Setter
@Entity
public class UserUpdateRequest {

    static {
        mapper
        .typeMap(UserUpdateRequest.class, User.class)
        .addMappings(mapper ->  mapper.skip(User::setId));
    }
    

    @Id @GeneratedValue Long id;
    
    String firstName;
    String lastName;
    String email;
    String city;
    String phoneNumber;
    String profilePicture;
    LocalDateTime requestedAt;

}