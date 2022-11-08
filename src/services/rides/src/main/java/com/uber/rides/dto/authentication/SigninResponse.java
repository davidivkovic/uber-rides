package com.uber.rides.dto.authentication;

import com.uber.rides.dto.UserDTO;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public class SigninResponse {
    
    public UserDTO user;
    public String token;

}
