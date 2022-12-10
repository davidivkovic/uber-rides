package com.uber.rides.ws;

import static com.uber.rides.util.Utils.*;

import com.fasterxml.jackson.core.JsonProcessingException;

public interface OutboundMessage {

    public abstract String type();

    public default String serialize() throws JsonProcessingException {
        return type() + '\n' + jsonMapper.writeValueAsString(this);
    }

}