package com.uber.rides.dto.authentication;

import lombok.AllArgsConstructor;

import com.uber.rides.dto.UserDTO;

@AllArgsConstructor
public class SigninResponse {
    
    public UserDTO user;
    public String token;

}
