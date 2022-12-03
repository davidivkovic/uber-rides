package com.uber.rides.controller;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.validation.constraints.Min;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import static com.speedment.jpastreamer.streamconfiguration.StreamConfiguration.*;

import com.uber.rides.database.DbContext;
import com.uber.rides.dto.TripDTO;
import com.uber.rides.model.Route;
import com.uber.rides.model.Route$;
import com.uber.rides.model.Trip;
import com.uber.rides.model.Trip$;
import com.uber.rides.model.User;
import com.uber.rides.model.User$;
import com.uber.rides.model.User.Roles;

import static com.uber.rides.Utils.*;

@RestController
@RequestMapping("/trips")
public class Trips extends Controller {

    static final long PAGE_SIZE = 8;

    @Autowired DbContext context;

    @Transactional
    @GetMapping("/trips")
    @Secured({ Roles.DRIVER, Roles.RIDER, Roles.ADMIN })
    public Object getTrips(@RequestParam Long userId, @RequestParam @Min(0) int page, @RequestParam String order) {

        var userRole = authenticatedUserRole();
        var isAdmin = Roles.ADMIN.equals(userRole);
        var isDriver = Roles.DRIVER.equals(userRole);
        if (
            !userId.equals(authenticatedUserId()) &&
            !isAdmin
        ) {
            return badRequest("Cannot view other users' trips.");
        }

        if (!isAdmin) {
            userId = authenticatedUserId();
        }

        Comparator<Trip> comparator;
        
        if (order.equalsIgnoreCase("PRICE_ASC")) {
            comparator = Trip$.totalPrice;
        }
        else if (order.equalsIgnoreCase("PRICE_DESC")) {
            comparator = Trip$.totalPrice.reversed();
        }
        else if (order.equalsIgnoreCase("START_ASC")) {
            comparator = Trip$.startedAt;
        }
        else {
            comparator = Trip$.startedAt.reversed();
        }

        Stream<List<Trip>> stream;
        var user = context.readonlyQuery().stream(User.class)
            .filter(User$.id.equal(userId));

        if (isDriver) {
            stream = user.map(User::getTripsAsDriver);

        }
        else {
            stream = user.map(User::getTripsAsRider);
        }

        var trips = stream
            .flatMap(Collection::stream)
            .collect(Collectors.toList())
            .stream()
            .sorted(comparator)
            .skip(page * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .toList();
        
        var routes = context.readonlyQuery().stream(
                of(Route.class)
                .joining(Route$.stops)
            )
            .filter(Route$.id.in(trips.stream().map(Trip::getRouteId).toList()))
            .collect(Collectors.toMap(Route::getId, Function.identity()));
        
        return context.readonlyQuery().stream(
                of(Trip.class)
                .joining(Trip$.driver)
                .joining(Trip$.riders)
                .joining(Trip$.payments)
            )
            .filter(Trip$.id.in(trips.stream().map(Trip::getId).toList()))
            .sorted(comparator)
            .map(trip -> {
                trip.setRoute(routes.get(trip.getRouteId()));
                return mapper.map(trip, TripDTO.class);
            })
            .toList();

    }
}
