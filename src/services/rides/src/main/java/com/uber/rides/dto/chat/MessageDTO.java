package com.uber.rides.dto.chat;

import java.sql.Timestamp;
import java.time.LocalDateTime;

import com.uber.rides.dto.user.UserDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageDTO {
    UserDTO sender;
    String content;
    Timestamp sentAt;

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = Timestamp.valueOf(sentAt);
    }
}
