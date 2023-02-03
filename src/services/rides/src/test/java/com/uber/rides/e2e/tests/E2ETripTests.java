package com.uber.rides.e2e.tests;

import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;

import com.uber.rides.e2e.pages.ChooseRidePage;
import com.uber.rides.e2e.pages.PassengersPage;
import com.uber.rides.e2e.pages.LookingPage;
import com.uber.rides.util.Driver;
import com.uber.rides.util.Utils;

@Order(2)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@SpringBootTest(webEnvironment= SpringBootTest.WebEnvironment.DEFINED_PORT)
public class E2ETripTests {

    LookingPage lookingPage;
    ChooseRidePage chooseRidePage;
    PassengersPage passengersPage;
    String uberSpaUrl;

    @Autowired
    public E2ETripTests(Environment environment) {
        this.uberSpaUrl = environment.getProperty("uber.rides.uber-spa.url");
        this.lookingPage = new LookingPage(Driver.driver, Driver.wait);
        this.chooseRidePage = new ChooseRidePage(Driver.driver, Driver.wait);
        this.passengersPage = new PassengersPage(Driver.driver, Driver.wait);
    }

    @BeforeAll
    public void setUp() {
        Utils.setPaymentGateway();
    }

    @Test
    @Order(1)
    public void testLooking_fillLocationsForm_noDirections() {
        lookingPage.navigate(uberSpaUrl);
        lookingPage.fillLookingForm(
            "West 28th Street, New York, NY, USA",
            "Radnička 69, Novi Sad, Serbia"
        );
        assertTrue(lookingPage.hasError());
    }

    @Test
    @Order(2)
    public void testLooking_fillLocationsForm_hasDirections() {
        lookingPage.navigate(uberSpaUrl);
        lookingPage.addStop();
        lookingPage.fillLookingForm(
        "West 28th Street, New York, NY, USA",
            "West 28th Street, New York, NY, USA",
            "West 28th Street, New York, NY, USA"
        );
        assertTrue(lookingPage.canContinue());
        lookingPage.continueToRide();
    }

    @Test
    @Order(3)
    public void testOrderRide_chooseCar_noDriverAvailable() {
        chooseRidePage.selectCar("UBER_BLACK");
        chooseRidePage.orderRide();
        assertTrue(chooseRidePage.hasNotBeenRedirected());
    }

