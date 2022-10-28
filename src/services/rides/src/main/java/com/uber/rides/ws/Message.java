package com.uber.rides.ws;

import static com.uber.rides.Utils.*;
import static com.uber.rides.ws.ErrorMessages.*;

public interface Message<T extends UserData> {

    public void handle(T sender);

}

class EmptyMessage implements Message<UserData> {

    public void handle(UserData sender) {
        sendMessage(sender.session, UNKNOWN_MESSAGE_TYPE);
    }
    
}