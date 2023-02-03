package com.uber.rides.e2e.tests;

import com.uber.rides.e2e.pages.LoginPage;
import com.uber.rides.model.PaymentMethod;
import com.uber.rides.model.User;
import com.uber.rides.util.Driver;

import org.junit.jupiter.api.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import javax.persistence.EntityManagerFactory;

import java.time.LocalDate;

import static com.uber.rides.util.DbUtil.merge;
import static com.uber.rides.util.DbUtil.persist;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Order(1)
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@SpringBootTest(webEnvironment= SpringBootTest.WebEnvironment.DEFINED_PORT)
public class E2ELoginTests {

    @Autowired EntityManagerFactory emf;
    @Autowired PasswordEncoder passwordEncoder;

    LoginPage loginPage;
    String uberSpaUrl;

    @Autowired
    public E2ELoginTests(Environment environment) {
        this.uberSpaUrl = environment.getProperty("uber.rides.uber-spa.url");
        this.loginPage = new LoginPage(Driver.driver, Driver.wait);
    }

    @BeforeAll
    public void setUp() {
        var rider = User.builder()
                .email("test-user-e2e@uber.com")
                .password(passwordEncoder.encode("test-password"))
                .emailConfirmed(true)
                .role(User.Roles.RIDER)
                .firstName("Infinity")
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
    }

    @Test
    @Order(1)
    public void testLogin_wrongPassword_unsuccessful() {
        loginPage.navigate(uberSpaUrl);
        loginPage.login("test-user-e2e@uber.com", "wrong-password");
        assertTrue(loginPage.hasError());
    }

    @Test
    @Order(2)
    public void testLogin_wrongPassword_successful() {
        loginPage.navigate(uberSpaUrl);
        loginPage.login("test-user-e2e@uber.com", "test-password");
        assertTrue(loginPage.hasRedirected());
    }
}
