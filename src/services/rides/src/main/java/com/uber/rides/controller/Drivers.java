package com.uber.rides.controller;

import static com.uber.rides.util.Utils.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uber.rides.database.DbContext;
import com.uber.rides.dto.user.DriverDTO;
import com.uber.rides.model.User;
import com.uber.rides.model.User$;
import com.uber.rides.model.User.Roles;
import com.uber.rides.ws.Store;
import com.uber.rides.ws.WS;
import com.uber.rides.ws.driver.DriverData;

@RestController
@RequestMapping("/drivers")
public class Drivers extends Controller {

    static final long PAGE_SIZE = 8;

    @Autowired DbContext context;
    @Autowired WS ws;
    @Autowired Store store;

    @PostMapping("/free-all")
    public void freeAll() {
        store.drivers.values().forEach(d -> {
            d.setAvailable(true);
            d.getUser().setCurrentTrip(null);
        });
    }

    @Transactional
    @GetMapping("/")
    @Secured({ Roles.ADMIN })
    public Object getDrivers(@RequestParam int page, @RequestParam String criteria, @RequestParam String query) {
        
        if (criteria.equalsIgnoreCase("ACTIVE")) {
            return store.drivers
                .values()
                .stream()
                .map(DriverData::getUser)
                .filter(u -> 
                    (u.getFirstName() + u.getLastName())
                    .toUpperCase()
                    .contains(query.toUpperCase())
                )
                .sorted((d1, d2) -> d1.getFirstName().compareTo(d2.getFirstName()))
                .skip(page * PAGE_SIZE)
                .limit(PAGE_SIZE)
                .map(driver -> mapper.map(driver, DriverDTO.class))
                .toList();
        }

        return context.query()
            .stream(User.class)
            .filter(
                User$.firstName.containsIgnoreCase(query).or(
                User$.lastName.containsIgnoreCase(query))
            )
            .sorted(User$.firstName)
            .skip(page * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .map(driver -> {
                driver.setCurrentTrip(ws.getCurrentTrip(driver));
                return mapper.map(driver, DriverDTO.class);
            })
            .toList();

    }
    
}
