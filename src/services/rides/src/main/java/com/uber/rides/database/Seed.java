package com.uber.rides.database;

import net.datafaker.Faker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.uber.rides.model.*;
import com.uber.rides.model.User.Roles;

@Component
public class Seed {

    @Autowired DbContext context;
    @Autowired PasswordEncoder passwordEncoder;

    @Transactional
    @EventListener
    public void handleContextRefresh(ContextRefreshedEvent event) {
        var admins = context
            .query()
            .stream(User.class)
            .filter(User$.email.startsWith("admin-x-"))
            .toList();

        if (admins.size() == 3) return;
        
        var faker = new Faker();
        for (int i = 1; i <= 3; i++) {
            var user = User
                .builder()
                .firstName(faker.name().firstName())
                .lastName(faker.name().lastName())
                .phoneNumber(faker.phoneNumber().phoneNumber())
                .email("admin-x-" + i + "@uber.com")
                .password(passwordEncoder.encode("admin"))
                .role(Roles.ADMIN)
                .emailConfirmed(true)
                .city(faker.address().city())
                .profilePicture(
                    "https://xsgames.co/randomusers/assets/avatars/" +
                    (faker.random().nextInt(0, 2) == 0 ? "male" : "female") + "/" +
                    faker.random().nextInt(10, 75) + ".jpg"
                )
                .build();
            context.db().persist(user);
        }
    }
    
}
