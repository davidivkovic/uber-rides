package com.uber.rides.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.uber.rides.model.User;

public class Controller {

    static final String USER_NOT_EXIST = "User does not exist.";
    static final String EMAIL_NOT_FOUND = "The email you entered doesn't belong to an account.";
    static final String CONNECTION_ENDED = "Your connection has ended. Please refresh the page to connect again.";
 
    public Object badRequest(Object response) {
        return ResponseEntity.badRequest().body(response);
    }

    public Object ok(Object response) {
        return ResponseEntity.ok(response);
    }

    public Object ok() {
        return ResponseEntity.ok().build();
    }

    public Object notFound() {
        return ResponseEntity.notFound().build();
    }

    public Object emailNotFound() {
        return badRequest(EMAIL_NOT_FOUND);
    }

    public static boolean isAuthenticated() {
        return !SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName()
            .equalsIgnoreCase("AnonymousUser");
    }

    public static Long authenticatedUserId() {
        return Long.parseLong(
            SecurityContextHolder
                .getContext()
                .getAuthentication() 
                .getName()
        );
    }

    public static String authenticatedUserRole() {
        return SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getAuthorities()
            .stream()
            .map(GrantedAuthority::getAuthority)
            .findFirst()
            .orElse(User.Roles.ANONYMOUS);
    }
    
}