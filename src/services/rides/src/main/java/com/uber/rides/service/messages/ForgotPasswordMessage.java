package com.uber.rides.service.messages;

import com.uber.rides.model.User;

import lombok.Getter;

import java.util.Map;

@Getter
public class ForgotPasswordMessage extends EmailMessage {

    private final String subject = "Reset your password";

    public ForgotPasswordMessage(User user) {
        templateMap = Map.of("name", user.getFirstName(), "code", user.getConfirmationCode().value, "email", user.getEmail());
        template = "forgot-password-uber";
    }
}
