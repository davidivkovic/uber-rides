package com.uber.rides.controller;

import java.util.Collection;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import static com.speedment.jpastreamer.streamconfiguration.StreamConfiguration.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uber.rides.database.DbContext;
import com.uber.rides.dto.route.GeocodeRequest;
import com.uber.rides.dto.route.PreviewRouteRequest;
import com.uber.rides.dto.user.CreateRouteRequest;
import com.uber.rides.model.Route;
import com.uber.rides.model.User;
import com.uber.rides.model.User$;
import com.uber.rides.model.User.Roles;
import com.uber.rides.service.GoogleMaps;
import com.uber.rides.service.ImageStore;
import com.uber.rides.simulator.DriverSimulator;
import com.uber.rides.ws.Store;

import static com.uber.rides.util.Utils.*;

@RestController
@RequestMapping("/routes")
public class Routes extends Controller {

    @Autowired DbContext context;
    @Autowired ImageStore images;
    @Autowired GoogleMaps maps;
    @Autowired Store store;
    @Autowired Route.Service routes;
    @Autowired DriverSimulator simulator;

    @PostMapping("/geocode")
    public Object geocode(@RequestBody GeocodeRequest request) {
        return ok(simulator.geocode(request.placeId, request.address, request.lat, request.lng));
    }

    @PostMapping("/preview")
    @Secured({ Roles.ANONYMOUS, Roles.RIDER })
    @Transactional
    public Object previewRoute(@Validated @RequestBody PreviewRouteRequest request) {

        var riderData = store.riders.get(authenticatedUserId());
        if (isAuthenticated() && riderData == null) {
            return badRequest("Your connection has ended. Please refresh the page to connect again.");
        }

        var result = routes.previewRoute(
            riderData,
            request.getOriginPlaceId(),
            request.getDestinationPlaceId(),
            request.getWaypointPlaceIds(), 
            !"respect-waypoints".equals(request.getRoutingPreference()), 
            "cheapest-route".equals(request.getRoutingPreference()),
            request.getScheduledAt()
        );

        if (!result.success()) return badRequest(result.error());
        return ok(result.result());
        
    }

    // I don't think this is used anywhere
    @Transactional
    @PostMapping("")
    @Secured({ Roles.RIDER })
    public Object create(@Validated @RequestBody CreateRouteRequest request) {

        var user = context.db().getReference(User.class, authenticatedUserId());
        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        var route = mapper.map(request, Route.class);
        var directions = maps.getDirections(route);
        if (directions == null) {
            return badRequest("Could not get route directions at this time. Please try again later.");
        }

        var thumbnail = maps.getRouteThumbnail(directions);
        if (thumbnail.length == 0) {
            return badRequest("Could not get route thumbnail at this time. Please try again later.");
        }

        var imageName = images.persist(thumbnail, ".png");
        route.setThumbnail(imageName);
        
        context.db().persist(route);
        
        return ok(route.getId());
    }
    
    @GetMapping(
        path = "/favorites/{id}/thumbnail",
        produces = { MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_JPEG_VALUE }
    )
    public Object getThumbnail(@PathVariable("id") @NotBlank String thumbnailId) {

        var picturePath = images.getPath(thumbnailId);
        if (picturePath == null) return notFound();

        return new FileSystemResource(picturePath);

    }
    
    @Transactional
    @PostMapping("/favorites")
    @Secured({ Roles.RIDER })
    public Object addToFavorites(@RequestParam @NotNull Long routeId) {

        var user = context.db().getReference(User.class, authenticatedUserId());
        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        var route = context.db().getReference(Route.class, routeId);
        if (route == null) {
            return badRequest("Route does not exist.");
        }
        
        user.addFavoriteRoute(route);
        context.db().persist(route);
        
        return ok(route.getId());

    }
        
    @Transactional
    @PostMapping("/favorites/{id}/remove")
    @Secured({ Roles.RIDER })
    public Object removeFavoriteRoute(@PathVariable("id") Long routeId) {

        var user = context.query().stream(
            of(User.class)
            .joining(User$.favoriteRoutes)
        )
        .filter(User$.id.equal(authenticatedUserId()))
        .findFirst()
        .orElse(null);
        
        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        user.removeFavoriteRoute(routeId);

        return ok();
    }

    @Transactional
    @GetMapping("/favorites")
    @Secured({ Roles.RIDER })
    public Object getFavoriteRoutes() {
        return context.readonlyQuery().stream(
                of(User.class)
                .joining(User$.favoriteRoutes)
            )
            .filter(User$.id.equal(authenticatedUserId()))
            .map(User::getFavoriteRoutes)
            .flatMap(Collection::stream)
            .toList();
    }
    
}
