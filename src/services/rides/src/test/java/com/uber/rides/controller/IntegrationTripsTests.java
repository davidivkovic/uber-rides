package com.uber.rides.controller;

import java.net.URISyntaxException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.concurrent.ExecutionException;

import javax.persistence.EntityManagerFactory;
import javax.transaction.Transactional;

import org.apache.http.client.utils.URIBuilder;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.annotation.DirtiesContext.ClassMode;

import com.uber.rides.dto.TripDTO;
import com.uber.rides.dto.route.PreviewRouteRequest;
import com.uber.rides.dto.route.PreviewRouteResponse;
import com.uber.rides.model.Car;
import com.uber.rides.model.PaymentMethod;
import com.uber.rides.model.User;
import com.uber.rides.security.JWT;
import com.uber.rides.util.Utils;

import static com.uber.rides.util.DbUtil.*;

@Order(3)
@Transactional
@ActiveProfiles("test")
@TestMethodOrder(OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DirtiesContext(classMode = ClassMode.AFTER_CLASS)
@SpringBootTest(webEnvironment=WebEnvironment.DEFINED_PORT)
public class IntegrationTripsTests {

    @Autowired TestRestTemplate restTemplate;
    @Autowired EntityManagerFactory emf;
    @Autowired PasswordEncoder passwordEncoder;
    WebSocketSession riderWs;
    WebSocketSession driverWs;
    User rider;
    User driver;

    @BeforeAll
    @Transactional
    public void beforeClass() throws InterruptedException, ExecutionException, URISyntaxException {

        Utils.setPaymentGateway();
        this.rider = User.builder()
            .email("test-user-integration@uber.com")
            .password(passwordEncoder.encode("test-password"))
            .emailConfirmed(true)
            .role(User.Roles.RIDER)
            .firstName("Test")
            .lastName("User")
            .city("New York")
            .phoneNumber("555-555-5555")
            .build();

        persist(rider, emf);

        var paymentMethod = PaymentMethod.builder()
            .cardNumber("4111 1111 1111 1111")
            .expirationDate(LocalDate.of(2024, 4, 1))
            .country("United States")
            .type(PaymentMethod.Type.CARD)
            .nickname("Visa")
            .token("fqzxbmjt")
            .cvv("581")
            .user(rider)
            .build();

        rider.addPaymentMethod(paymentMethod);
        rider.setDefaultPaymentMethod(paymentMethod);

        persist(paymentMethod, emf);
        merge(rider, emf);

        var car = Car.builder()
            .make("BMW")
            .model("435i")
            .year((short)2014)
            .registration("AWI-2049")
            .type(Car.getByType(Car.Types.UBER_BLACK))
            .build();

        persist(car, emf);

        this.driver = User.builder()
            .email("test-driver-integration@uber.com")
            .password(passwordEncoder.encode("test-password"))
            .emailConfirmed(true)
            .role(User.Roles.DRIVER)
            .firstName("Test")
            .lastName("Driver")
            .city("New York")   
            .phoneNumber("555-555-5555")
            .build();

        driver.setCar(car);
        persist(driver, emf);

        this.riderWs = new StandardWebSocketClient()
            .doHandshake(
                new TextWebSocketHandler(),
                new WebSocketHttpHeaders(),
                new URIBuilder("ws://localhost:8000/ws")
                .addParameter("token", JWT.getJWT(rider))
                .build()
            )
            .get();

        this.driverWs = new StandardWebSocketClient()
            .doHandshake(
                new TextWebSocketHandler(),
                new WebSocketHttpHeaders(),
                new URIBuilder("ws://localhost:8000/ws")
                .addParameter("token", JWT.getJWT(driver))
                .build()
            )
            .get();
    }

    @Test
    @Order(1)
    public void testRiderPreviewRoute_whenScheduled_returnsValidRoute() throws Exception {

        var request = new PreviewRouteRequest();
        request.setOriginPlaceId("ChIJ37Y_oL5ZwokR6aBVDYfRJfk"); // 338 1/2 W 23rd St
        request.setDestinationPlaceId("ChIJ2W9-JbpZwokRzQsULciwL0g"); // 124 8th Ave
        request.setRoutingPreference("fastest-route");
        request.setWaypointPlaceIds(new String[] { });
        request.setScheduledAt(LocalDateTime.now().plusSeconds(1));

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(JWT.getJWT(rider));
        HttpEntity<PreviewRouteRequest> entity = new HttpEntity<>(request, headers);
    
        var response = restTemplate.postForEntity("/routes/preview", entity, PreviewRouteResponse.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        var body = response.getBody();

        assertNotNull(body);
        assertTrue(body.getRoutes().length > 0);
        assertTrue(riderWs.isOpen());

    }

    @Test
    @Order(2)
    public void testRiderChooseRide_withCarType_returnsTripPreview() {
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(JWT.getJWT(rider));
        var entity = new HttpEntity<>(headers);

        var response = restTemplate.postForEntity("/trips/choose-ride?rideType=UBER_BLACK", entity, TripDTO.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());

        var body = response.getBody();

        assertNotNull(body);
        assertEquals(Car.Types.UBER_BLACK, body.getCar().getType().getCarType());
        assertNotNull(body.getRoute());

    }

    @Test 
    @Order(3)
    void testRiderOrderRide_whenScheduledAndDriverAvailable_returnsSuccess() {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(JWT.getJWT(rider));
        var entity = new HttpEntity<>(headers);

        var response = restTemplate.postForEntity("/trips/order-ride", entity, String.class);

        assertNull(response.getBody());
        assertEquals(HttpStatus.OK, response.getStatusCode());

    }

    @Test 
    @Order(4)
    void testDriverCancelTrip_whenPickupPending_returnsSuccess() {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(JWT.getJWT(driver));
        var entity = new HttpEntity<>(headers);

        var response = restTemplate.postForEntity(
            "/trips/cancel?reason=The passenger did not show up", 
            entity, 
            Void.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());

    }

    @Test 
    @Order(5)
    void testDriverCancelTrip_whenPickupNotPending_returnsError() {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(JWT.getJWT(driver));
        var entity = new HttpEntity<>(headers);

        var response = restTemplate.postForEntity(
            "/trips/cancel?reason=The passenger did not show up", 
            entity, 
            Void.class
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());

    }

    


}