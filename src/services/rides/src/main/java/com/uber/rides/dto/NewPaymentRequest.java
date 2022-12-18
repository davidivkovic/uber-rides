package com.uber.rides.dto;

import javax.validation.constraints.NotBlank;

import lombok.Getter;

@Getter
public class NewPaymentRequest {
    @NotBlank String nonce;
    @NotBlank String amount;
    String email;
}
    
