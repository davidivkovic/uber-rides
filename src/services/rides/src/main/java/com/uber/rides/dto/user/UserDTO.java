package com.uber.rides.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import com.uber.rides.model.Car;
import com.uber.rides.model.PaymentMethod;
import com.uber.rides.model.User;
import com.uber.rides.controller.Users;

import static com.uber.rides.util.Utils.mapper;

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
                String profilePicture;
                var source = c.getSource();
                if (source == null) profilePicture = User.DEFAULT_PFP;
                else profilePicture = (String) source;
                if (profilePicture.startsWith("http")) return profilePicture;
                return linkTo(methodOn(Users.class).getProfilePicture(profilePicture)).toString();
            })
            .map(User::getProfilePicture, UserDTO::setProfilePicture)
        );
    }

    Long id;
    String role;
    String firstName;
    String lastName;
    String email;
    String city;
    String phoneNumber;
    String profilePicture;
    boolean blocked;
    String blockReason;
    boolean completedRegistration;
    PaymentMethod.Type defaultPmt;
    Car car;
    double rating;
    boolean online;
    double minutesFatigue;

}