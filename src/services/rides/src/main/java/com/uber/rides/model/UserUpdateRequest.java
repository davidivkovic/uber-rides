package com.uber.rides.model;

import java.time.LocalDateTime;
import javax.persistence.Id;

import com.uber.rides.controller.Users;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;

import lombok.Getter;
import lombok.Setter;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import static com.uber.rides.util.Utils.mapper;

@Getter
@Setter
@Entity
public class UserUpdateRequest {

    static {
        mapper
        .typeMap(UserUpdateRequest.class, User.class)
        .addMappings(mapper ->  mapper.skip(User::setId));

        mapper
        .typeMap(User.class, UserUpdateRequest.class)
        .addMappings(mapper ->  mapper.skip(UserUpdateRequest::setId));
    }
    

    @Id @GeneratedValue Long id;
    Long userId;
    String firstName;
    String lastName;
    String email;
    String city;
    String phoneNumber;
    String profilePicture;
    LocalDateTime requestedAt;

    public UserUpdateRequest withProfilePicture() {
        if (profilePicture == null) profilePicture = User.DEFAULT_PFP;
        else if (profilePicture.startsWith("http")) return this;
        profilePicture = linkTo(methodOn(Users.class).getProfilePicture(profilePicture)).toString();
        return this;
    }

}