package com.uber.rides.service;

import com.speedment.jpastreamer.application.JPAStreamer;
import com.uber.rides.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

//    private final JPAStreamer jpaStreamer;
//
//    @Autowired
//    public CustomUserDetailsService(JPAStreamer jpaStreamer) {
//        this.jpaStreamer = jpaStreamer;
//    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return new User();
    }
}
