package com.uber.rides.dto.authentication;

import javax.validation.constraints.NotBlank;

import lombok.Getter;

@Getter
public class SignInRequest {
    
    @NotBlank String email;
    @NotBlank String password;

}