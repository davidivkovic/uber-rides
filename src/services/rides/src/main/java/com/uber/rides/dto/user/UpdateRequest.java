package com.uber.rides.dto.user;

import javax.validation.constraints.NotBlank;

import lombok.Getter;

@Getter
public class UpdateRequest {

    @NotBlank String firstName;
    @NotBlank String lastName;
    @NotBlank String email;
    @NotBlank String city;
    @NotBlank String phoneNumber;

}