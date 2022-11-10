package com.uber.rides.service.messages;

import com.uber.rides.model.User;

import lombok.Getter;

import java.util.Map;

@Getter
public class ConfirmEmailMessage extends EmailMessage {

    private final String subject = "Welcome to Uber";

    public ConfirmEmailMessage(User user) {
        templateMap = Map.of("name", user.getFirstName(), "code", user.getConfirmationCode().value);
        template = "confirm-email-uber";
    }

}
