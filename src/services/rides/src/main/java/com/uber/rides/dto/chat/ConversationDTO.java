package com.uber.rides.dto.chat;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

import com.uber.rides.dto.user.UserDTO;

@Getter
@Setter
public class ConversationDTO {
    Long id;
    List<MessageDTO> messages;
    UserDTO admin;
    UserDTO client;
    boolean closed;
    LocalDateTime closedAt;
}
