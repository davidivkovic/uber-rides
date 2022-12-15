package com.uber.rides.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import static com.uber.rides.util.Utils.mapper;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import com.uber.rides.model.User;
import com.uber.rides.controller.Users;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    
    static {
        mapper
        .typeMap(User.class, UserDTO.class)
        .addMappings(mapper -> mapper
            .using(c -> {
                var profilePicture = (String) c.getSource();
                if (profilePicture == null) profilePicture = User.DEFAULT_PFP;
                else if (profilePicture.startsWith("http")) return profilePicture;
                return linkTo(methodOn(Users.class).getProfilePicture(profilePicture)).toString();
            })
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