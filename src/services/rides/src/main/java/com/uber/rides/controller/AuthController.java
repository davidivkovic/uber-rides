package com.uber.rides.controller;

import com.speedment.jpastreamer.application.JPAStreamer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

//    private final JPAStreamer jpaStreamer;
//
//    @Autowired
//    public AuthController(JPAStreamer jpaStreamer) {
//        this.jpaStreamer = jpaStreamer;
//    }

    @GetMapping("/test")
    public String home() {
        return "test";
    }
}
