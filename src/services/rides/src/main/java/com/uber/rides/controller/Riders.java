package com.uber.rides.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uber.rides.model.User.Roles;
import com.uber.rides.database.DbContext;
import com.uber.rides.dto.user.UserDTO;
import com.uber.rides.model.Location;
import com.uber.rides.model.Route;
import com.uber.rides.model.Trip;
import com.uber.rides.model.User;
import com.uber.rides.model.User$;

import static com.uber.rides.Utils.*;

@RestController
public class Riders extends Controller {

    static final long PAGE_SIZE = 8;

	@Autowired DbContext context;

    @Transactional
    @GetMapping("/")
    @Secured({ Roles.ADMIN, Roles.RIDER })
    public Object getRiders(@RequestParam int page, @RequestParam String query) {

        return context.query()
            .stream(User.class)
            .filter(
                User$.firstName.containsIgnoreCase(query).or(
                User$.lastName.containsIgnoreCase(query))
            )
            .sorted(User$.firstName)
            .skip(page * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .map(driver -> mapper.map(driver, UserDTO.class))
            .toList();

    }

	@Transactional
    @PostMapping("/test")
	public Object makeTrip() {

		var u = new User();
		// var u = context.db().find(User.class, 3L);

		var r = new Route();
		r.setName("Work");
		r.setStart(Location.builder().longitude(21).latitude(24).build());
		r.setStops(List.of(Location.builder().longitude(23).latitude(25).build()));

		var t1 = new Trip();
		t1.setRiders(Set.of(u));
		t1.setTotalPrice(LocalDateTime.now().getSecond());
		t1.setCurrency("USD");
		t1.setStartedAt(LocalDateTime.now().minusHours(2));
		t1.setCompletedAt(LocalDateTime.now().plusHours(1));
		t1.setRoute(r);
		
		context.db().persist(u);
		context.db().persist(r);
		context.db().persist(t1);

		return ok();
	}

}