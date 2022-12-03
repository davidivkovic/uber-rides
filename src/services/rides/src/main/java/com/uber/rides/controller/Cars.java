package com.uber.rides.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uber.rides.database.DbContext;
import com.uber.rides.dto.user.RegisterCarRequest;
import com.uber.rides.model.Car;
import com.uber.rides.model.User;
import com.uber.rides.model.User.Roles;

import static com.uber.rides.Utils.*;

@RestController
@RequestMapping("/cars")
public class Cars extends Controller {
    
    @Autowired DbContext context;

    @Transactional
    @PostMapping("/")
    @Secured({ Roles.ADMIN })
    public Object registerCar(@Validated @RequestBody RegisterCarRequest request) {

        var user = context.db().getReference(User.class, request.getUserId());
        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        var car = mapper.map(request, Car.class);
        car.setType(Car.getByType(request.getType()));
        user.setCar(car);

        context.db().persist(car);

        return ok();

    }

    @GetMapping("/types")
    public Object getTypes() {
        return Car.availableTypes;
    }

}
