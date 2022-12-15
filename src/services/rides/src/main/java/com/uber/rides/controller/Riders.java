package com.uber.rides.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uber.rides.model.User.Roles;
import com.uber.rides.simulator.DriverSimulator;
import com.uber.rides.database.DbContext;
import com.uber.rides.dto.user.UserDTO;
import com.uber.rides.model.User;
import com.uber.rides.model.User$;

import static com.uber.rides.util.Utils.*;

@RestController
@RequestMapping("/riders")
public class Riders extends Controller {

    static final long PAGE_SIZE = 8;

	@Autowired DbContext context;
	@Autowired DriverSimulator simulator;

    @Transactional
    @GetMapping()
    @Secured({ Roles.ADMIN, Roles.RIDER })
    public Object getRiders(@RequestParam int page, @RequestParam String query) {
		if (!StringUtils.hasText(query)) {
			return new UserDTO[0];
		}
        return context.query()
            .stream(User.class)
            .filter(
                User$.firstName.containsIgnoreCase(query).or(
                User$.lastName.containsIgnoreCase(query))
            )
			.filter(
				User$.role.equal(Roles.RIDER).and(
				User$.id.notEqual(authenticatedUserId()))
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
		simulator.start(20);
		return ok();
	}

}