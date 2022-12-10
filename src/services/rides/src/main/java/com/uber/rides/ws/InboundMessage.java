package com.uber.rides.ws;

import static com.uber.rides.ws.ErrorMessages.*;

public interface InboundMessage<T extends UserData> {

    public static final String TYPE = null;
    public void handle(T sender);

}

class EmptyMessage implements InboundMessage<UserData> {

    public static final String TYPE = "EMPTY_MESSAGE";

    @Override
    public void handle(UserData sender) {
        WS.sendMessage(sender.session, UNKNOWN_MESSAGE_TYPE);
    }
    
}