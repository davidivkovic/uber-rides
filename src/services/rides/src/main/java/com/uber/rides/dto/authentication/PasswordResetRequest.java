package com.uber.rides.dto.authentication;

import javax.validation.constraints.NotBlank;

import lombok.Getter;

@Getter
public class PasswordResetRequest {
    
    @NotBlank String email;
    @NotBlank String password;
    @NotBlank String code;

}
