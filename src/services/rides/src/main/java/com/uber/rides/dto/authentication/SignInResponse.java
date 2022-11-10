package com.uber.rides.dto.authentication;

import lombok.AllArgsConstructor;

import com.uber.rides.dto.UserDTO;

@AllArgsConstructor
public class SignInResponse {
    
    public UserDTO userDTO;
    public String token;

}
