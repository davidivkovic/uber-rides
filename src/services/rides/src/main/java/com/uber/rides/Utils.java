package com.uber.rides;

import java.io.IOException;
import java.util.Collections;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.modelmapper.ModelMapper;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

public class Utils {

    private Utils() { }
    
    /* Global Constants */

    public static final String USER_ID = "USER_ID";
    public static final String USER_ROLE = "USER_ROLE";
    public static final String SCHEDULED = "SCHEDULED";
    public static final String UNCHECKED = "unchecked";

    /* JSON Mapper */

    public static final ObjectMapper jsonMapper = new ObjectMapper()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    /* DTO Mapper */

    public static final ModelMapper mapper = new ModelMapper();

    static {
        mapper.getConfiguration().setAmbiguityIgnored(true);
    }

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

    /* Google Auth */

    public static final GoogleIdTokenVerifier googleAuth = new GoogleIdTokenVerifier.Builder(
        new NetHttpTransport(),
        new GsonFactory()
    )
    .setAudience(Collections.singletonList("152138799418-rdah02vercon3q3p9ubkh4jqa5vflpcr.apps.googleusercontent.com"))
    .build();

}