package com.uber.rides.ws.chat;

import com.uber.rides.dto.chat.MessageDTO;
import com.uber.rides.ws.OutboundMessage;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class OutboundChatMessage implements OutboundMessage {

    public MessageDTO message;
    public boolean conversationEnd;
    public Long conversationId;

    @Override
    public String messageType() { return "MESSAGE_RECEIVED"; }
    
}
