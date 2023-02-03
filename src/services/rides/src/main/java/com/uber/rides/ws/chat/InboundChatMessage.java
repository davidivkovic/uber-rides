package com.uber.rides.ws.chat;

import java.time.LocalDateTime;

import javax.transaction.Transactional;

import lombok.Getter;
import lombok.Setter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uber.rides.database.DbContext;
import com.uber.rides.dto.chat.MessageDTO;
import com.uber.rides.model.Conversation;
import com.uber.rides.model.User;
import com.uber.rides.ws.InboundMessage;
import com.uber.rides.ws.Store;
import com.uber.rides.ws.UserData;
import com.uber.rides.ws.WS;
import com.uber.rides.ws.admin.AdminData;
import com.uber.rides.model.Conversation$;

import static com.uber.rides.util.Utils.*;

@Service
@Getter
@Setter
public class InboundChatMessage implements InboundMessage<UserData> {
    
    public static final String TYPE = "MESSAGE_SENT";

    public String content;
    public Long conversationId;
    public boolean closeConversation;

    User recipient;
    Conversation conversation;

    @Autowired WS ws;
    @Autowired Store store;
    @Autowired DbContext context;

    @Override
    @Transactional
    public void handle(UserData sender) {
        if(conversationId == null) {
            var admin = store.admins.values().stream()
                .filter(AdminData::isOnline)
                .findFirst()
                .orElse(null);
            if(admin == null ) {
                ws.sendMessageToUser(
                    sender.getUser().getId(), 
                    new OutboundChatMessage(new MessageDTO(), false, null)
                );
                return;
            }   
            recipient = admin.getUser();
            conversation = new Conversation(admin.getUser(), sender.getUser());
        } else {
            conversation = context.query()
                .stream(Conversation.class)
                .filter(Conversation$.id.equal(conversationId))
                .findFirst()
                .orElse(null);

            if(conversation == null || conversation.isClosed()) return;

            if(conversation.getAdmin().getId().equals(sender.getUser().getId())) {
                recipient = conversation.getClient();
            } else {
                recipient = conversation.getAdmin();
            }
        }

        if(closeConversation) {
            conversation.setClosed(true);
            conversation.setClosedAt(LocalDateTime.now());
            context.db().persist(conversation);
            ws.sendMessageToUser(recipient.getId(), new OutboundChatMessage(new MessageDTO(), true, conversation.getId()));
            return;
        }

        var message = conversation.addMessage(sender.getUser(), content);
        context.db().persist(message);
        context.db().persist(conversation);
        var messageDto = mapper.map(message, MessageDTO.class);
        ws.sendMessageToUser(recipient.getId(), new OutboundChatMessage(messageDto, closeConversation, conversation.getId()));
    }
}
