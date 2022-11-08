package com.uber.rides.dto.authentication;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

import lombok.Getter;

import com.uber.rides.model.User;

@Getter
public class RegistrationRequest {
    
    @NotBlank public String firstName;
    @NotBlank public String lastName;
    @NotBlank @Email public String email;
    @NotBlank public String password; 
    @NotBlank public String city;
    @NotBlank public String phoneNumber;
    @Pattern(regexp = User.Roles.DRIVER + "|" + User.Roles.RIDER) 
    @NotBlank public String role;

}