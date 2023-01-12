package com.uber.rides.dto.chat;

import java.util.List;

import com.uber.rides.dto.user.UserDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConversationDTO {
    Long id;
    List<MessageDTO> messages;
    UserDTO admin;
    UserDTO client;
    boolean closed;
}
