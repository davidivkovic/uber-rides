package com.uber.rides.data;

import java.time.LocalDateTime;
import java.util.Set;

import javax.persistence.EntityManagerFactory;
import javax.transaction.Transactional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.annotation.Commit;
import org.springframework.test.context.ActiveProfiles;

import com.uber.rides.model.Route;
import com.uber.rides.model.Trip;
import com.uber.rides.model.User;
import com.uber.rides.util.DbUtil;

@Commit
@Transactional
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@SpringBootTest(webEnvironment=WebEnvironment.DEFINED_PORT)
public class DataRouteTests {
    
    @Autowired Route.Service service;

    @Autowired EntityManagerFactory emf;
    
    @Test
    public void testHasOverlappingScheduledTrips_noOverlapping_returnsFalse() {

        var rider = User.builder()
            .email("test-user-data-2@uber.com")
            .password("test-password")
            .emailConfirmed(true)
            .role(User.Roles.RIDER)
            .firstName("Test")
            .lastName("User")
            .city("New York")
            .phoneNumber("555-555-5555")
            .build();

            DbUtil.persist(rider, emf);

        var hasOverlappingScheduledTrips = service.hasOverlappingScheduledTrips(rider.getId(), LocalDateTime.now().plusHours(1));

        assertFalse(hasOverlappingScheduledTrips);

    }

    @Test
    public void testHasOverlappingScheduledTrips_hasOverlapping_returnsTrue() {

        var scheduledAt = LocalDateTime.now().plusHours(1);
        var rider = User.builder()
            .email("test-user-data-3@uber.com")
            .password("test-password")
            .emailConfirmed(true)
            .role(User.Roles.RIDER)
            .firstName("Test")
            .lastName("User")
            .city("New York")
            .phoneNumber("555-555-5555")
            .build();

        DbUtil.persist(rider, emf);

        var trip = Trip.builder()
            .riders(Set.of(rider))
            .status(Trip.Status.PAID)
            .scheduled(true)
            .scheduledAt(scheduledAt)
            .build();

        DbUtil.persist(trip, emf);

        var hasOverlappingScheduledTrips = service.hasOverlappingScheduledTrips(rider.getId(), scheduledAt.minusMinutes(10));

        assertTrue(hasOverlappingScheduledTrips);

    }


}