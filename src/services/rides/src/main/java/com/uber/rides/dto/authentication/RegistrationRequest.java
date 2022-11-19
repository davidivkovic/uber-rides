package com.uber.rides.dto.authentication;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

import lombok.Getter;
import lombok.Setter;

import com.uber.rides.model.User;

@Getter 
@Setter
public class RegistrationRequest {
    
    @NotBlank String firstName;
    @NotBlank String lastName;
    @NotBlank @Email String email;
    @NotBlank String password; 
    @NotBlank String city;
    @NotBlank String phoneNumber;
    @Pattern(regexp = User.Roles.DRIVER + "|" + User.Roles.RIDER) 
    @NotBlank String role;

}