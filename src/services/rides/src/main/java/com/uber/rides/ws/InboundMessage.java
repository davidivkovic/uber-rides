package com.uber.rides.ws;

import static com.uber.rides.ws.ErrorMessages.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

public interface InboundMessage<T extends UserData> {

    public static final String TYPE = null;
    public void handle(T sender);

}

@Service
class EmptyMessage implements InboundMessage<UserData> {

    public static final String TYPE = "EMPTY_MESSAGE";

    @Autowired WS ws;

    @Override
    public void handle(UserData sender) {
        ws.sendMessage(sender.session, UNKNOWN_MESSAGE_TYPE);
    }
    
}