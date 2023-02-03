package com.uber.rides.util;

import java.util.Collections;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import com.braintreegateway.BraintreeGateway;
import com.braintreegateway.Environment;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

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
    public static final String BT_PR_KEY = "M2VhMzYxYTgzZTE4MjlhZGU4N2M0ZDY2ZDUxZDY0YzE=";
    public static final String BT_PU_KEY = "amd2YmQ4OTN2amM3YmY5Zg==";
    public static final String BT_TOKEN = "MjRyNDdncTR4ZHR0NHp5Nw==";

    public static final String PR_KEY = new String(Base64.getDecoder().decode(BT_PR_KEY), StandardCharsets.UTF_8);
    public static final String PU_KEY = new String(Base64.getDecoder().decode(BT_PU_KEY), StandardCharsets.UTF_8);
    public static final String TOKEN = new String(Base64.getDecoder().decode(BT_TOKEN), StandardCharsets.UTF_8);

    /* Service Result Helper */

    public static class Result<T> {
        boolean success;
        T result;
        String error;

        public boolean success() {
            return success;
        }

        public String error() {
            return error;
        }

        public T result() {
            return result;
        }

        public static <T> Result<T> empty() {
            var result = new Result<T>();
            result.success = true;
            return result;
        }

        public static <T, E> Result<T> error(Result<E> value) {
            var result = new Result<T>();
            result.success = false;
            result.error = value.error;
            return result;
        }

        public static <T> Result<T> value(T value) {
            var result = new Result<T>();
            result.success = true;
            result.result = value;
            return result;
        }

        public static <T> Result<T> error(String error) {
            var result = new Result<T>();
            result.success = false;
            result.error = error;
            return result;
        }
    }

    /* JSON Mapper */

    public static final ObjectMapper jsonMapper = new ObjectMapper()
        .registerModules(new JavaTimeModule())
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
        .configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false)
        .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
        .configure(MapperFeature.CAN_OVERRIDE_ACCESS_MODIFIERS, false)
        .setSerializationInclusion(Include.NON_NULL)
        .findAndRegisterModules();

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

    /* Payment processor */

    public static BraintreeGateway gateway;

    public static void setPaymentGateway () {
        gateway = new BraintreeGateway(
            Environment.SANDBOX,
            TOKEN,
            PU_KEY,
            PR_KEY
        );
    }

    static {
        setPaymentGateway();
    }

}