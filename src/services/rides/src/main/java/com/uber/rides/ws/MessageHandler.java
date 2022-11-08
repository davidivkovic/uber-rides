package com.uber.rides.ws;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;

import com.uber.rides.ws.driver.messages.*;

import static com.uber.rides.Utils.*;

@Component
@SuppressWarnings(UNCHECKED)
public class MessageHandler {
    
    @Autowired AutowireCapableBeanFactory container;
    Logger log = LoggerFactory.getLogger(MessageHandler.class);
    
    static EmptyMessage emptyMessage = new EmptyMessage();
    
    public void handle(UserData sender, String type, String payload) {
        
        var messageType = switch (type) {
            /* Driver events */
            case UpdateLocation.TYPE -> UpdateLocation.class;
            case ConfirmTrip.TYPE -> ConfirmTrip.class;
            case StartTrip.TYPE -> StartTrip.class;

            /* Rider events */

            /* Catch unknown events */
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