package com.uber.rides;

import com.uber.rides.controller.IntegrationTripsTests;
import com.uber.rides.data.*;
import com.uber.rides.e2e.tests.*;

import org.junit.platform.suite.api.*;

@Suite
@SelectClasses({ 
    E2ELoginTests.class, 
    E2ETripTests.class,
    IntegrationTripsTests.class, 
    DataTripTests.class, 
    DataRouteTests.class 
})
@SelectPackages({
    "com.uber.rides.data", 
    "com.uber.rides.model", 
    "com.uber.rides.service",
    "com.uber.rides.ws"
})
public class TestSuite { }
