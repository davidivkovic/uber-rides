package com.uber.rides.ws;

import static com.uber.rides.util.Utils.*;

import com.fasterxml.jackson.core.JsonProcessingException;

public interface OutboundMessage {

    public abstract String messageType();

    public default String serialize() throws JsonProcessingException {
        return messageType() + '\n' + jsonMapper.writeValueAsString(this);
    }

}