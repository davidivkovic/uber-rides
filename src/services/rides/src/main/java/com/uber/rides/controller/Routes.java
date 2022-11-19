package com.uber.rides.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import static com.speedment.jpastreamer.streamconfiguration.StreamConfiguration.*;

import com.uber.rides.database.DbContext;
import com.uber.rides.dto.user.CreateRouteRequest;
import com.uber.rides.model.Route;
import com.uber.rides.model.User;
import com.uber.rides.model.User$;
import com.uber.rides.model.User.Roles;

import static com.uber.rides.Utils.*;

import java.util.Collection;

@RestController("/routes")
public class Routes extends Controller {

    @Autowired DbContext context;
    
    @Transactional
    @PostMapping("/favorites")
    @Secured({ Roles.RIDER })
    public Object createFavoriteRoute(@Validated @RequestBody CreateRouteRequest request) {

        var user = context.db().getReference(User.class, authenticatedUserId());
        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        var route = mapper.map(request, Route.class);
        user.addFavoriteRoute(route);
        context.db().persist(route);
        
        return ok();

    }

        
    // @Transactional
    // @PostMapping("/favorites/{id}/remove")
    // @Secured({ Roles.RIDER })
    // public Object removeFavoriteRoute(@PathVariable("id") Long routeId) {
        
    //     return ok();

    // }

    @Transactional
    @GetMapping("/favorites")
    @Secured({ Roles.RIDER })
    public Object getFavoriteRoutes() {

        return context.readonlyQuery().stream(
                of(User.class)
                .joining(User$.favoriteRoutes)
            )
            .map(User::getFavoriteRoutes)
            .flatMap(Collection::stream)
            .toList();

    }
    
}
