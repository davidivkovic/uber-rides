package com.uber.rides;

import java.util.TimeZone;

import javax.annotation.PostConstruct;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.integration.config.EnableIntegration;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableIntegration
@EnableAsync
@SpringBootApplication
public class UberRidesApplication {

    public static void main(String[] args) {
        System.setProperty("org.apache.tomcat.websocket.DEFAULT_BUFFER_SIZE", "65536");
        SpringApplication.run(UberRidesApplication.class, args);
    }

    @PostConstruct
    public void init(){
      TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }

}