package com.uber.rides.controller;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.Collection;
import java.util.concurrent.ExecutionException;

import javax.validation.constraints.NotBlank;

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
import org.springframework.web.bind.annotation.RestController;

import static com.speedment.jpastreamer.streamconfiguration.StreamConfiguration.*;

import com.uber.rides.database.DbContext;
import com.uber.rides.dto.user.CreateRouteRequest;
import com.uber.rides.model.Route;
import com.uber.rides.model.User;
import com.uber.rides.model.User$;
import com.uber.rides.model.User.Roles;
import com.uber.rides.service.ImageStore;

import static com.uber.rides.Utils.*;

@RestController
@RequestMapping("/routes")
public class Routes extends Controller {

    @Autowired DbContext context;
    @Autowired ImageStore images;

    
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
    public Object createFavoriteRoute(@Validated @RequestBody CreateRouteRequest request) {

        var user = context.db().getReference(User.class, authenticatedUserId());
        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        var url = "https://maps.googleapis.com/maps/api/staticmap?center=Berkeley,CA&zoom=14&size=400x400&key=AIzaSyCkUOdZ5y7hMm0yrcCQoCvLwzdM6M8s5qk";
        try {
            byte[] thumbnail = HttpClient.newHttpClient().sendAsync(
                HttpRequest.newBuilder(new URI(url)).GET().build(),
                BodyHandlers.ofByteArray()
            )
            .thenApply(HttpResponse::body)
            .get();
            var imageName = images.persist(thumbnail, ".png");

            var route = mapper.map(request, Route.class);
            route.setThumbnail(imageName);
            user.addFavoriteRoute(route);
            context.db().persist(route);
        } catch (InterruptedException | ExecutionException | URISyntaxException e) {
            return badRequest("Could not create route preview image.");
        }
        
        return ok();

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
