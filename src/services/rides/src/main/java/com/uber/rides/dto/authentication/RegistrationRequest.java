package com.uber.rides.dto.authentication;

import com.uber.rides.model.User;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

@Getter
@Setter
public class RegistrationRequest {
    
    @NotBlank public String firstName;
    @NotBlank public String lastName;
    @NotBlank @Email public String email;
    @NotBlank public String password; 
    @NotBlank public String city;
    @NotBlank public String phoneNumber;
    @Pattern(regexp = User.Roles.DRIVER + "|" + User.Roles.RIDER) 
    @NotBlank public String role;
    public MultipartFile profilePicture;

}