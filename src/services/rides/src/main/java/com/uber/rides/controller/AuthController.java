package com.uber.rides.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @GetMapping("/test")
    public String home() {
        return "test";
    }
}
