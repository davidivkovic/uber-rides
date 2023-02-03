package com.uber.rides.data;

import java.time.LocalDate;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.context.ActiveProfiles;

import com.uber.rides.model.PaymentMethod;
import com.uber.rides.model.Trip;
import com.uber.rides.model.User;

@Transactional
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@SpringBootTest(webEnvironment=WebEnvironment.DEFINED_PORT)
public class DataTripTests {
    
    @Autowired Trip.Service service;

    @PersistenceContext EntityManager db;

    @Test
    public void testGetPaymentMethods_noPaymentMethod_returnsNothing() {

        var user = User.builder()
            .email("test-user-data@uber.com")
            .password("test-password")
            .emailConfirmed(true)
            .role(User.Roles.RIDER)
            .firstName("Test")
            .lastName("User")
            .city("New York")
            .phoneNumber("555-555-5555")
            .build();

        db.persist(user);

        var paymentMethods = service.getPaymentMethods(List.of(user.getId()));

        paymentMethods.stream().forEach(Assertions::assertNull);

    }

    @Test
    public void testGetPaymentMethods_hasPaymentMethod_returnsPaymentMethods() {

        var user = User.builder()
            .email("test-user-data-1@uber.com")
            .password("test-password")
            .emailConfirmed(true)
            .role(User.Roles.RIDER)
            .firstName("Test")
            .lastName("User")
            .city("New York")
            .phoneNumber("555-555-5555")
            .build();

        db.persist(user);

        var paymentMethod = PaymentMethod.builder()
            .cardNumber("4111 1111 1111 1111")
            .expirationDate(LocalDate.of(2024, 4, 1))
            .country("United States")
            .type(PaymentMethod.Type.CARD)
            .nickname("Visa")
            .token("fqzxbmjt")
            .cvv("581")
            .user(user)
            .build();

        user.addPaymentMethod(paymentMethod);
        user.setDefaultPaymentMethod(paymentMethod);

        db.persist(paymentMethod);
        db.merge(user);

        var paymentMethods = service.getPaymentMethods(List.of(user.getId()));

        assertEquals(1, paymentMethods.size());

    }

}