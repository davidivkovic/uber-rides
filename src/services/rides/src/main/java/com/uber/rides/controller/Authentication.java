package com.uber.rides.controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.security.GeneralSecurityException;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.validation.constraints.NotBlank;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;

import com.uber.rides.dto.UserDTO;
import com.uber.rides.dto.authentication.PasswordResetRequest;
import com.uber.rides.dto.authentication.RegistrationRequest;
import com.uber.rides.dto.authentication.SigninRequest;
import com.uber.rides.dto.authentication.SigninResponse;
import com.uber.rides.model.User;
import com.uber.rides.model.User.OTP;
import com.uber.rides.security.JWT;
import com.uber.rides.service.UserService;

import static com.uber.rides.Utils.*;

@RestController
public class Authentication extends Controller {

    @Autowired UserService userService;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired AuthenticationManager authenticationManager;
    @Autowired JWT jwt;
    @PersistenceContext EntityManager db;

    @Transactional
    @PostMapping("/register")
    public Object register(@Validated @RequestBody RegistrationRequest request) {

        var user = userService.findByEmail(request.getEmail());
        if (user != null) {
            return badRequest("This email isn't available. Please try another.");
        }

        user = modelMapper.map(request, User.class);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setConfirmationCode(OTP.generate(LocalDateTime.now()));
        db.persist(user);
        
        /* Posalji EMAIL */
        
        return ok();
    }

    @PostMapping("/signin")
    public Object signin(@Validated @RequestBody SigninRequest request) {  

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

            return new SigninResponse(
                modelMapper.map(user, UserDTO.class),
                jwt.getJWT(user)
            );
        }
        catch (BadCredentialsException e) {
            return badRequest("Invalid credentials");
        }
    }

    /* Method not finished in google cloud console - set cliendID */
    @Transactional
    @PostMapping("/signin/google")
    public Object googleSignin(@RequestParam(name = "idToken") @NotBlank String token) { 

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
            return new SigninResponse(
                modelMapper.map(user, UserDTO.class),
                jwt.getJWT(user)
            );
            
        } catch (GeneralSecurityException | IOException e) {
            return badRequest("Google Authentication is not possible at this moment.");
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

        user.setConfirmationCode(OTP.generate(LocalDateTime.now()));
        db.merge(user);

        /* Posalji EMAIL */

        return ok("An email confirmation code has been sent to " + email + ". It will be valid for 30 minutes.");
    }

    @Transactional
    @PostMapping("password/forgot")
    public Object forgotPassword(@RequestParam @NotBlank String email) {

        var user = userService.findByEmail(email);
        if (user == null) {
            return emailNotFound();
        }

        user.setConfirmationCode(OTP.generate(LocalDateTime.now()));
        db.merge(user);

        /* Posalji EMAIL */

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
    @PostMapping("password/reset")
    @Secured({ User.Roles.ADMIN, User.Roles.DRIVER, User.Roles.RIDER })
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
