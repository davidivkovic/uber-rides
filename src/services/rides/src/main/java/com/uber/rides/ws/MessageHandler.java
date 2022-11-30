package com.uber.rides.ws;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.stereotype.Component;

import com.uber.rides.model.User.Roles;
import com.uber.rides.ws.driver.messages.ConfirmTrip;
import com.uber.rides.ws.driver.messages.StartTrip;
import com.uber.rides.ws.driver.messages.UpdateLocation;

import static com.uber.rides.Utils.*;

@Component
@SuppressWarnings(UNCHECKED)
public class MessageHandler {
    
    @Autowired AutowireCapableBeanFactory container;
    Logger log = LoggerFactory.getLogger(MessageHandler.class);
    
    static EmptyMessage emptyMessage = new EmptyMessage();
    
    public void handle(UserData sender, String type, String payload) {

        Class<? extends Message<? extends UserData>> messageType = EmptyMessage.class;
        
        if (Roles.DRIVER.equals(sender.getRole())) messageType = switch (type) {
            case UpdateLocation.TYPE -> UpdateLocation.class;
            case ConfirmTrip.TYPE -> ConfirmTrip.class;
            case StartTrip.TYPE -> StartTrip.class;
            /* Catch unknown events */
            default -> EmptyMessage.class;
        };

        else if (Roles.RIDER.equals(sender.getRole())) messageType = switch (type) {
            default -> EmptyMessage.class;
        };
        
        else if (Roles.ADMIN.equals(sender.getRole())) messageType = switch (type) {
            default -> EmptyMessage.class;
        };
        
        try { 
            if (messageType == EmptyMessage.class) {
                emptyMessage.handle(sender);
            } else {
                var message = (Message<UserData>) jsonMapper
                    .readerForUpdating(container.getBean(messageType))
                    .readValue(payload);
                message.handle(sender);
            }
        } 
        catch (JsonProcessingException e) { 
            sendMessage(sender.session, ErrorMessages.MALFORMED_BODY);
        } 
        catch (BeansException e) {
            sendMessage(sender.session, ErrorMessages.INTERNAL_SERVER_ERROR);
            log.error("Failed to create service of type {}.", messageType.getName());
        }
    }
}