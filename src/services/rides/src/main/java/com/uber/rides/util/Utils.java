package com.uber.rides.util;

import java.util.Collections;

import com.fasterxml.jackson.annotation.JsonInclude.Include;
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
    public static final String STORE_MAP = "STORE_MAP";
    public static final String CONTAINER = "CONTAINER";
    public static final String UNCHECKED = "unchecked";
    public static final String GM_KEY = "QUl6YVN5Q2h6alBMdjNyLS1CalVqaGx2Si1sUnlnb2VyM0NWMm9F";
    public static final String GM_KEY_STATIC = "QUl6YVN5QjQxRFJVYktXSkhQeGFGak1Bd2Ryeld6YlZLYXJ0Tkdn";
    public static final String BT_PR_KEY_STATIC = "M2VhMzYxYTgzZTE4MjlhZGU4N2M0ZDY2ZDUxZDY0YzE=";
    public static final String BT_PU_KEY_STATIC = "amd2YmQ4OTN2amM3YmY5Zg==";
    public static final String BT_TOKEN_STATIC = "MjRyNDdncTR4ZHR0NHp5Nw==";

    /* JSON Mapper */

    public static final ObjectMapper jsonMapper = new ObjectMapper()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
        .setSerializationInclusion(Include.NON_NULL);

    /* DTO Mapper */

    public static final ModelMapper mapper = new ModelMapper();

    static {
        mapper.getConfiguration().setAmbiguityIgnored(true);
    }

    /* Google Auth */

    public static final GoogleIdTokenVerifier googleAuth = new GoogleIdTokenVerifier.Builder(
        new NetHttpTransport(),
        new GsonFactory()
    )
    .setAudience(Collections.singletonList("152138799418-rdah02vercon3q3p9ubkh4jqa5vflpcr.apps.googleusercontent.com"))
    .build();

}