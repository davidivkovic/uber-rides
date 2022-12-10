package com.uber.rides.ws;

import org.springframework.web.socket.TextMessage;

public class ErrorMessages {

    private ErrorMessages() {}

    /* WebSockets Error Messages */

    public static final TextMessage DISCONNECTED = new TextMessage("DISCONNECTED");
    public static final TextMessage USER_NOT_CONNECTED = new TextMessage("USER_NOT_CONNECTED");
    public static final TextMessage UNKNOWN_MESSAGE_TYPE = new TextMessage("UNKNOWN_MESSAGE_TYPE");
    public static final TextMessage MALFORMED = new TextMessage("MALFORMED_MESSAGE");
    public static final TextMessage MALFORMED_BODY = new TextMessage("MALFORMED_MESSAGE_BODY");
    public static final TextMessage INTERNAL_SERVER_ERROR = new TextMessage("INTERNAL_SERVER_ERROR");
}
