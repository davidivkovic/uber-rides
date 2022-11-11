package com.uber.rides.dto.user;

import javax.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO {

    long id;
    String role;
    String firstName;
    String lastName;
    String email;
    String city;
    String phoneNumber;
    String profilePicture;
    String blocked;
    
}