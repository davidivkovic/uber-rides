package com.uber.rides.ws.driver.messages.out;

import com.uber.rides.ws.OutboundMessage;

public class Instructions implements OutboundMessage {

    public String instructions;

    @Override
    public String messageType() { return "INSTRUCTIONS"; }
    
}
