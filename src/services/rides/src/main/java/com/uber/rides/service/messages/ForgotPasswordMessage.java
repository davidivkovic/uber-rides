package com.uber.rides.service.messages;

import com.uber.rides.model.User;

import lombok.Getter;

import java.util.HashMap;

@Getter
public class ForgotPasswordMessage extends EmailMessage {

    private final String subject = "Reset your password";

    public ForgotPasswordMessage(User user) {
        templateMap = new HashMap<>() {{
            put("name", user.getFirstName());
            put("email", user.getEmail());
            put("code", user.getConfirmationCode().value);
        }};
        template = "forgot-password-uber";
    }
}
