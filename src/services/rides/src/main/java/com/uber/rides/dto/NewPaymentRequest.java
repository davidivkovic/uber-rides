package com.uber.rides.dto;

import javax.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NewPaymentRequest {
    @NotBlank String nonce;
    @NotBlank String amount;
    String email;
}
    
