package com.uber.rides.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TokenDTO {
    private String accessToken;
    private long expiresIn;
    private long userId;
    private String userRole;

    public TokenDTO(String accessToken, long expiresIn, long userId, String userRole) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.userId = userId;
        this.userRole = userRole;
    }
}