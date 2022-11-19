package com.uber.rides.dto.user;

import lombok.Getter;
import lombok.Setter;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import com.uber.rides.model.User;
import com.uber.rides.controller.Users;

import static com.uber.rides.Utils.mapper;

@Getter
@Setter
public class UserDTO {
    
    static {
        mapper
        .typeMap(User.class, UserDTO.class)
        .addMappings(mapper -> 
            mapper
                .using(c -> linkTo(methodOn(Users.class).getProfilePicture((String) c.getSource())).toString())
                .map(User::getProfilePicture, UserDTO::setProfilePicture)
        );
    }

    long id;
    String role;
    String firstName;
    String lastName;
    String email;
    String city;
    String phoneNumber;
    String profilePicture;
    boolean blocked;
    boolean completedRegistration;

}