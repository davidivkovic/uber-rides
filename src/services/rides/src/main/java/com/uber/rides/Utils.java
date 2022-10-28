package com.uber.rides;

import java.io.IOException;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

public class Utils {

    private Utils() {}

    /* Global Constants */

    public static final String USER_ID = "USER_ID";
    public static final String SCHEDULED = "SCHEDULED";
    public static final String UNCHECKED = "unchecked";

    /* JSON Serializer */

    public static final ObjectMapper mapper = new ObjectMapper()
        .setVisibility(PropertyAccessor.FIELD, Visibility.ANY)
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    /* WebSocket Methods */

    public static void sendMessage(WebSocketSession session, String message) {
        sendMessage(session, new TextMessage(message));
    }

    public static void sendMessage(WebSocketSession session, TextMessage message) {
        if (session != null && session.isOpen()) {
            try { session.sendMessage(message); }
            catch (IOException e) { /* Nothing special */ }
        }
    }

}