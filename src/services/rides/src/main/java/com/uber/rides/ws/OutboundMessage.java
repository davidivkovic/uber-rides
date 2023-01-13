package com.uber.rides.ws;

import com.fasterxml.jackson.core.JsonProcessingException;

import static com.uber.rides.util.Utils.jsonMapper;

public interface OutboundMessage {

    public abstract String messageType();

    public default String serialize() throws JsonProcessingException {
        return messageType() + '\n' + jsonMapper.writeValueAsString(this);
    }

}