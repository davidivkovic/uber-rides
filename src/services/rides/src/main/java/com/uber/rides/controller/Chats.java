package com.uber.rides.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.speedment.jpastreamer.streamconfiguration.StreamConfiguration.*;

import com.uber.rides.database.DbContext;
import com.uber.rides.dto.chat.ConversationDTO;
import com.uber.rides.model.Conversation;
import com.uber.rides.model.Conversation$;
import com.uber.rides.model.User.Roles;

import static com.uber.rides.util.Utils.mapper;

import javax.transaction.Transactional;
import javax.validation.constraints.NotBlank;

@RestController
@RequestMapping("/chats")
public class Chats extends Controller {
    
    @Autowired DbContext context;

    @Secured({ Roles.ADMIN })
    @Transactional
    @GetMapping("/")
    public Object getAllChats() {
        return context.readonlyQuery()
            .stream(Conversation.class)
            .map(conversation -> mapper.map(conversation, ConversationDTO.class))
            .toList();
    }

    @Secured({Roles.ADMIN, Roles.DRIVER, Roles.RIDER})
    @GetMapping("/{id}")
    @Transactional
    public Object getChat(@PathVariable("id") @NotBlank Long chatId) {
        return context.query().stream(
                of(Conversation.class)
                .joining(Conversation$.messages)
                .joining(Conversation$.client)
                .joining(Conversation$.admin))
            .filter(Conversation$.id.equal(chatId))
            .map(conversation -> mapper.map(conversation, ConversationDTO.class))
            .findFirst()
            .orElse(null);
    }

    @Secured({ Roles.RIDER, Roles.DRIVER })
    @GetMapping("/recent")
    @Transactional
    public Object getRecentChat() {
        return context.query()
            .stream(Conversation.class)
            .filter(Conversation$.clientId.equal(authenticatedUserId()))
            .filter(Conversation$.closed.isFalse())
            .map(conversation -> mapper.map(conversation, ConversationDTO.class))
            .findFirst()
            .orElse(null);
    }
}
