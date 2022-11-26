package com.uber.rides.dto.user;

import javax.validation.constraints.NotBlank;

import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateRequest {

    @NotBlank String firstName;
    @NotBlank String lastName;
    @NotBlank String city;
    @NotBlank String phoneNumber;
    MultipartFile profilePictureFile;

}