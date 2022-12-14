package com.uber.rides.dto.user;

import javax.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter
public class NewCardRequest {
    @NotBlank String nickname;
    @NotBlank String cardNumber;
    @NotBlank String cvv;
    @NotBlank String expirationDate;
    @NotBlank String country;
}
