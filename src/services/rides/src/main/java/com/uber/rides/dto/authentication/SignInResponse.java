package com.uber.rides.dto.authentication;

import com.uber.rides.dto.user.UserDTO;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public class SignInResponse {
    
    public UserDTO user;
    public String accessToken;

}
