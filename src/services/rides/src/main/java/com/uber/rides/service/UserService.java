package com.uber.rides.service;

import com.speedment.jpastreamer.application.JPAStreamer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.uber.rides.model.User;
import com.uber.rides.model.User$;

@Service
public class UserService implements UserDetailsService {

    @Autowired JPAStreamer query;

    public User findByEmail(String email) {
        return query
            .stream(User.class)
            .filter(User$.email.equal(email))
            .findFirst()
            .orElse(null);
    }

    /* Do not use this method as it throws a runtime exception.
     * It is implemented only to provide for the AuthenticationManager.
     * Use findByEmail(String email) instead.
     */
    @Override
    public User loadUserByUsername(String email) throws UsernameNotFoundException {
        var user = findByEmail(email);
        if (user != null) return user;
        
        throw new UsernameNotFoundException(email);
    }
}
