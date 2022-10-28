package com.uber.rides.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Riders {

	@GetMapping("/")
	public String index() {
		return "Greetings from Riders.java";
	}

}