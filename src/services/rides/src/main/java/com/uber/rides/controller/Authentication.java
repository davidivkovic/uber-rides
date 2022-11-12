package com.uber.rides.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.uber.rides.dto.authentication.PasswordResetRequest;
import com.uber.rides.dto.authentication.RegistrationRequest;
import com.uber.rides.dto.authentication.SignInRequest;
import com.uber.rides.dto.authentication.SignInResponse;
import com.uber.rides.dto.user.UserDTO;
import com.uber.rides.model.User;
import com.uber.rides.security.JWT;
import com.uber.rides.service.EmailSender;
import com.uber.rides.service.UserService;
import com.uber.rides.service.messages.ConfirmEmailMessage;
import com.uber.rides.service.messages.ForgotPasswordMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import javax.validation.constraints.NotBlank;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.UUID;

import static com.uber.rides.Utils.*;

@RestController
@RequestMapping("/authentication")
@CrossOrigin
public class Authentication extends Controller {

    @Autowired
    UserService userService;
    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    JWT jwt;

    @Autowired
    EmailSender emailSender;

    @PersistenceContext
    EntityManager db;

    @Transactional
    @PostMapping(value = "/register", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public Object register(@ModelAttribute RegistrationRequest registrationRequest) throws IOException {

        var user = userService.findByEmail(registrationRequest.getEmail());
        if (user != null) {
            return badRequest("This email isn't available. Please try another.");
        }

        var propertyMapper = modelMapper.createTypeMap(RegistrationRequest.class, User.class);
        var imageWithUUID = UUID.randomUUID() + "-" + registrationRequest.getProfilePicture().getOriginalFilename();
        propertyMapper.addMappings(
                mapper -> mapper.map(src -> imageWithUUID, User::setProfilePicture)
        );
        user = propertyMapper.map(registrationRequest);
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        user.setConfirmationCode(User.OTP.generate(LocalDateTime.now()));
        db.persist(user);

        Path fileNameAndPath = Paths.get(USER_IMAGES_DIR, imageWithUUID);
        Files.write(fileNameAndPath, registrationRequest.getProfilePicture().getBytes());
        emailSender.send(user.getEmail(), new ConfirmEmailMessage(user));

        return ok();
    }

    @PostMapping("/signin")
    public Object signin(@Validated @RequestBody SignInRequest request) {

        try {
            var result = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            var user = (User) result.getPrincipal();
            if (!user.isEmailConfirmed()) {
                return badRequest("This email address has not been confirmed yet.");
            }

            return new SignInResponse(
                    modelMapper.map(user, UserDTO.class),
                    jwt.getJWT(user)
            );
        } catch (BadCredentialsException e) {
            return badRequest("Invalid credentials");
        }
    }

    /* Method not finished in google cloud console - set cliendID */
    @Transactional
    @PostMapping("/signin/google")
    public Object googleSignIn(@RequestParam(name = "idToken") @NotBlank String token) {

        try {
            var result = googleAuth.verify(token);
            if (result == null) return badRequest("Google Token is not valid.");

            Payload payload = result.getPayload();

            var user = userService.findByEmail(payload.getEmail());
            if (user == null) {
                user = User
                        .builder()
                        .email((String) payload.get("email"))
                        .emailConfirmed(payload.getEmailVerified())
                        .profilePicture((String) payload.get("picture"))
                        .firstName((String) payload.get("given_name"))
                        .lastName((String) payload.get("family_name"))
                        .build();
                db.persist(user);
            }
            return new SignInResponse(
                    modelMapper.map(user, UserDTO.class),
                    jwt.getJWT(user)
            );

        } catch (GeneralSecurityException | IOException e) {
            return badRequest("Google Authentication is not possible at this moment.");
        }
    }

    @SuppressWarnings("unchecked")
    @Transactional
    @PostMapping("/signin/facebook")
    public Object facebookSignIn(@RequestParam(name = "userId") @NotBlank String userId, @RequestParam(name = "accessToken") @NotBlank String token) {
        var restTemplate = new RestTemplate();
        String url = "https://graph.facebook.com/%s?fields=id,email,first_name,last_name&access_token=%s".formatted(userId, token);
        try {
            var response = restTemplate.getForEntity(url, Object.class);
            var payload = (LinkedHashMap<String, String>) response.getBody();
            if (payload != null) {
                String email = payload.get("email");
                var user = userService.findByEmail(email);
                if (user == null) {
                    user = User
                            .builder()
                            .email(email)
                            .emailConfirmed(true)
                            .firstName(payload.get("first_name"))
                            .lastName(payload.get("last_name"))
                            .role(User.Roles.RIDER)
                            .build();
                    db.persist(user);
                }
                return new SignInResponse(
                        modelMapper.map(user, UserDTO.class),
                        jwt.getJWT(user)
                );
            }
            else {
                return badRequest("An error occurred");
            }
        }
        catch (HttpClientErrorException.BadRequest e) {
            return badRequest("Invalid access token");
        }
    }

    @Transactional
    @PostMapping("confirm-email")
    public Object confirmEmail(@RequestParam @NotBlank String email, @RequestParam @NotBlank String code) {

        var user = userService.findByEmail(email);
        if (user == null) {
            return emailNotFound();
        }

        var otp = user.getConfirmationCode();
        if (otp == null || !otp.isValid(code, LocalDateTime.now())) {
            return badRequest("Email confirmation code is invalid or expired.");
        }

        user.setEmailConfirmed(true);
        user.setConfirmationCode(null);
        db.merge(user);

        return ok();
    }

    @Transactional
    @PostMapping("resend-confirmation")
    public Object resendConfirmationEmail(@RequestParam @NotBlank String email) {

        var user = userService.findByEmail(email);
        if (user == null) {
            return emailNotFound();
        }

        user.setConfirmationCode(User.OTP.generate(LocalDateTime.now()));
        db.merge(user);

        emailSender.send(user.getEmail(), new ConfirmEmailMessage(user));

        return ok("An email confirmation code has been sent to " + email + ". It will be valid for 30 minutes.");
    }

    @Transactional
    @PostMapping("password/forgot")
    public Object forgotPassword(@RequestParam @NotBlank String email) {

        var user = userService.findByEmail(email);
        if (user == null) {
            return emailNotFound();
        }

        user.setConfirmationCode(User.OTP.generate(LocalDateTime.now()));
        db.merge(user);

        emailSender.send(user.getEmail(), new ForgotPasswordMessage(user));

        return ok("A password reset code has been sent to " + email + ". It will be valid for 30 minutes.");
    }

    @Transactional
    @PostMapping("password/reset")
    public Object resetPassword(@Validated @RequestBody PasswordResetRequest request) {

        var user = userService.findByEmail(request.getEmail());
        if (user == null) {
            return emailNotFound();
        }

        var otp = user.getConfirmationCode();
        if (otp == null || !otp.isValid(request.getCode(), LocalDateTime.now())) {
            return badRequest("Password reset code is invalid or expired.");
        }

        user.setConfirmationCode(null);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        db.merge(user);

        return ok();
    }

    /* Method needs additional checking */
    @Transactional
    @PostMapping("password/change")
    @Secured({User.Roles.ADMIN, User.Roles.DRIVER, User.Roles.RIDER})
    public Object changePassword(@NotBlank String currentPassword, @NotBlank String newPassword) {

        var user = db.find(User.class, authenticatedUserId());
        if (!passwordEncoder.encode(currentPassword).equals(user.getPassword())) {
            return badRequest("The provided password does not match the current one.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        db.merge(user);

        return ok();
    }

}
