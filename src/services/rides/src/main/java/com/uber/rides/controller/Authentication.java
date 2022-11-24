package com.uber.rides.controller;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;

import com.uber.rides.dto.authentication.PasswordResetRequest;
import com.uber.rides.dto.authentication.RegistrationRequest;
import com.uber.rides.dto.authentication.SignInRequest;
import com.uber.rides.dto.authentication.SignInResponse;
import com.uber.rides.dto.user.UserDTO;
import com.uber.rides.model.User;
import com.uber.rides.model.User.Roles;
import com.uber.rides.security.JWT;
import com.uber.rides.service.EmailSender;
import com.uber.rides.service.UserService;
import com.uber.rides.service.messages.ConfirmEmailMessage;
import com.uber.rides.service.messages.ForgotPasswordMessage;
import static com.uber.rides.Utils.*;

@RestController
@RequestMapping("/authentication")
public class Authentication extends Controller {

    @Autowired UserService userService;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired AuthenticationManager authenticationManager;
    @Autowired EmailSender emailSender;
    @PersistenceContext EntityManager db;

    @Transactional
    @PostMapping("/register")
    @Secured({ Roles.ANONYMOUS, Roles.ADMIN })
    public Object register(@Validated @RequestBody RegistrationRequest request) {

        var user = userService.findByEmail(request.getEmail());
        if (user != null) {
            return badRequest("This email isn't available. Please try another.");
        }

        user = mapper.map(request, User.class);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCompletedRegistration(true);

        if (user.getRole().equals(Roles.RIDER)) {
            user.setConfirmationCode(User.OTP.generate(LocalDateTime.now()));
        } 
        else if (authenticatedUserRole().equals(Roles.ADMIN)) {
            user.setEmailConfirmed(true);
        }
        else {
            return badRequest("Only administrators can register administrators and drivers.");
        }
        
        db.persist(user);
        if (!user.isEmailConfirmed()) {
            emailSender.send(user.getEmail(), new ConfirmEmailMessage(user));
        } 

        return ok();
    }

    @Transactional
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
                mapper.map(user, UserDTO.class),
                JWT.getJWT(user)
            );
        } catch (BadCredentialsException e) {
            return badRequest("The email and password combination is invalid.");
        }
    }

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
                    .role(Roles.RIDER)
                    .build();
                db.persist(user);
            }
            return new SignInResponse(
                mapper.map(user, UserDTO.class),
                JWT.getJWT(user)
            );

        } catch (GeneralSecurityException | IOException e) {
            return badRequest("Google Authentication is not possible at this moment.");
        }
    }

    @Transactional
    @SuppressWarnings(UNCHECKED)
    @PostMapping("/signin/facebook")
    public Object facebookSignIn(
        @RequestParam(name = "userId") @NotBlank String userId,
        @RequestParam(name = "accessToken") @NotBlank String token
    ) {
        if (!isValidAccessToken(token)) {
            return badRequest("Invalid access token");
        }
        var url = "https://graph.facebook.com/%s?fields=id,email,first_name,last_name&access_token=%s".formatted(userId, token);
        try {
            var response = new RestTemplate().getForEntity(url, Object.class);
            var payload = (LinkedHashMap<String, String>) response.getBody();
            if (payload == null) {
                return badRequest("An error occurred");
            }

            var email = payload.get("email");
            var user = userService.findByEmail(email);
            if (user == null) {
                user = User
                    .builder()
                    .email(email)
                    .emailConfirmed(true)
                    .firstName(payload.get("first_name"))
                    .lastName(payload.get("last_name"))
                    .role(Roles.RIDER)
                    .build();
                db.persist(user);
            }

            return new SignInResponse(
                mapper.map(user, UserDTO.class),
                JWT.getJWT(user)
            );
        }
        catch (HttpClientErrorException.BadRequest e) {
            return badRequest("Invalid access token");
        }
    }

    @SuppressWarnings(UNCHECKED)
    private boolean isValidAccessToken(String token) {
        var appAccessToken = getAppAccessToken();
        if (appAccessToken == null) return false;
        var url = "https://graph.facebook.com/debug_token?input_token=%s&access_token=%s".formatted(token, appAccessToken);
        var response = new RestTemplate().getForEntity(url, Object.class);
        var payload = (LinkedHashMap<String, LinkedHashMap<String, String>>) response.getBody();
        if (payload == null) return false;
        return !payload.get("data").containsKey("error");
    }

    @SuppressWarnings(UNCHECKED)
    private String getAppAccessToken() {
        var url = "https://graph.facebook.com/oauth/access_token?client_id=1762946884038679&client_secret=dd81ed25eddb336b08a544644d8c9658&grant_type=client_credentials";
        var response = new RestTemplate().getForEntity(url, Object.class);
        var payload = (LinkedHashMap<String, String>) response.getBody();
        if (payload == null) return null;
        return payload.get("access_token");
    }

    @Transactional
    @PostMapping("confirm-email")
    public Object confirmEmail(@RequestParam @NotBlank String email, @RequestParam @NotBlank String code) {

        var user = userService.findByEmail(email);
        if (user == null) {
            return emailNotFound();
        }
        
        if (user.isEmailConfirmed()) {
            return badRequest("This email has already been confirmed.");
        }

        var otp = user.getConfirmationCode();
        if (otp == null || !otp.isValid(code, LocalDateTime.now())) {
            return badRequest("Email verification code is invalid or expired.");
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

        if (user.isEmailConfirmed()) {
            return badRequest("This email has already been confirmed.");
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

    @Transactional
    @PostMapping("password/change")
    @Secured({ Roles.ADMIN, Roles.DRIVER, Roles.RIDER })
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
