package com.uber.rides.dto.user;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter
public class NewCardRequest {
    @NotBlank String nickname;
    @NotBlank String cardNumber;
    @NotBlank String cvv;
    @NotNull short year;
    @NotNull short month;
    @NotBlank String country;
    @NotBlank String nonce;
    boolean setDefault;
}
