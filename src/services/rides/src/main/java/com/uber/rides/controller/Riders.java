package com.uber.rides.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uber.rides.model.User.Roles;
import com.uber.rides.ws.Store;
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
    @Autowired Store store;

    @Transactional
    @GetMapping()
    @Secured({ Roles.ADMIN, Roles.RIDER })
    public Object getRiders(@RequestParam int page, @RequestParam String query) {

        var riders = context.query().stream(User.class);
        
        if (StringUtils.hasText(query)) {
            riders = riders.filter(
                User$.firstName.containsIgnoreCase(query)
                .or(User$.lastName.containsIgnoreCase(query))
                .or(User$.email.containsIgnoreCase(query))
                .or(User$.phoneNumber.contains(query))
            );
        }

        return riders
			.filter(
				User$.role.equal(Roles.RIDER).and(
				User$.id.notEqual(authenticatedUserId()))
			)
            .sorted(User$.firstName)
            .skip(page * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .map(rider -> {
                var dto = mapper.map(rider, UserDTO.class);
                dto.setOnline(store.riders.containsKey(rider.getId()));
                return dto;
            })
            .toList();
    }

}