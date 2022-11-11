package com.uber.rides.controller;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.validation.constraints.NotBlank;

import com.speedment.jpastreamer.application.JPAStreamer;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.uber.rides.dto.user.UpdateRequest;
import com.uber.rides.dto.user.UserDTO;
import com.uber.rides.model.*;

import static com.uber.rides.Utils.*;

@RestController
@RequestMapping("/users")
public class Users extends Controller {

    @PersistenceContext EntityManager db;
    @Autowired JPAStreamer query;
    
    /* Not finished */
    @Transactional
    @PostMapping("/update")
    @Secured({ User.Roles.DRIVER, User.Roles.RIDER })
    public Object update(@Validated @RequestBody UpdateRequest request) {

        var user = db.find(User.class, authenticatedUserId());
        if (user == null) return badRequest("User does not exist.");

        query.stream(User.class)
            .filter(User$.id.equal(user.getId()))
            .map(User::getUpdateRequest)
            .map(UserUpdate::getId)
            .forEach(r -> db.remove(r));

        var userUpdateRequest = modelMapper.map(request, UserUpdate.class);
        userUpdateRequest.setId(user.getId());

        db.persist(userUpdateRequest);

        return ok();
    }
    
    /* Not finished */
    @Transactional
    @PostMapping("/{id}/update")
    @Secured({ User.Roles.ADMIN })
    public Object update(@PathVariable("id") @NotBlank Long userId, @RequestParam String action) {

        action = action.toUpperCase();
        if (!action.matches("ACCEPT|REJECT")) {
            return badRequest("Invalid action. Valid actions are: ACCEPT, REJECT.");
        }

        var user = db.find(User.class, userId);
        if (user == null) return badRequest("User does not exist.");

        var updateRequest = query.stream(User.class)
            .filter(User$.id.equal(userId))
            .map(User::getUpdateRequest)
            .findFirst()
            .orElse(null);

        if (updateRequest == null) {
            return badRequest("User has no pending update requests.");
        }

        if (action.equals("ACCEPT")) {
            modelMapper.map(updateRequest, user);
            db.merge(user);
        }

        db.remove(updateRequest);

        return ok();

    }
    
}
