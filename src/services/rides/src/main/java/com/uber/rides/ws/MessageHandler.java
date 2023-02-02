package com.uber.rides.ws;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.uber.rides.ws.admin.AdminData;
import com.uber.rides.ws.chat.InboundChatMessage;
import com.uber.rides.ws.driver.DriverData;
import com.uber.rides.ws.driver.messages.in.ConfirmTrip;
import com.uber.rides.ws.driver.messages.in.EndTrip;
import com.uber.rides.ws.driver.messages.in.Online;
import com.uber.rides.ws.driver.messages.in.StartTrip;
import com.uber.rides.ws.driver.messages.in.UpdateLocation;
import com.uber.rides.ws.rider.RiderData;
import com.uber.rides.ws.rider.messages.in.AnswerTripInvite;
import com.uber.rides.ws.rider.messages.in.NotLooking;
import com.uber.rides.ws.rider.messages.in.RemoveTripPassenger;

import static com.uber.rides.util.Utils.*;
import static com.uber.rides.model.User.Roles.*;

@Component
@SuppressWarnings(UNCHECKED)
public class MessageHandler {
    
    @Autowired AutowireCapableBeanFactory container;
    @Lazy @Autowired WS ws;
    Logger log = LoggerFactory.getLogger(MessageHandler.class);

    static Map<String, Class<? extends InboundMessage<DriverData>>> driverMessages = Map.of(
        UpdateLocation.TYPE, UpdateLocation.class,
        ConfirmTrip.TYPE, ConfirmTrip.class,
        StartTrip.TYPE, StartTrip.class,
        EndTrip.TYPE, EndTrip.class,
        Online.TYPE, Online.class
    );

    static Map<String, Class<? extends InboundMessage<RiderData>>> riderMessages = Map.of(
        AnswerTripInvite.TYPE, AnswerTripInvite.class,
        NotLooking.TYPE, NotLooking.class,
        RemoveTripPassenger.TYPE, RemoveTripPassenger.class
    );

    static Map<String, Class<? extends InboundMessage<AdminData>>> adminMessages = Map.of(
        // No admin messages currently
    );

    static Map<String, Class<? extends InboundMessage<UserData>>> sharedMessages = Map.of(
        InboundChatMessage.TYPE, InboundChatMessage.class
    );

    static EmptyMessage emptyMessage = new EmptyMessage();
    
    public void handle(UserData sender, String type, String payload) {

        var messageType = switch (sender.getRole()) {
            case DRIVER -> driverMessages.get(type);
            case RIDER -> riderMessages.get(type);
            case ADMIN -> adminMessages.get(type);
            default -> EmptyMessage.class;
        }; 

        if (messageType == null) messageType = sharedMessages.get(type);
        if (messageType == null) {
            emptyMessage.handle(sender);
            return;
        }

        try { 
            var message = (InboundMessage<UserData>) jsonMapper
                .readerForUpdating(container.getBean(messageType))
                .readValue(payload);
            message.handle(sender);
        } 
        catch (JsonProcessingException e) { 
            ws.sendMessage(sender.session, ErrorMessages.MALFORMED_BODY);
        } 
        catch (BeansException e) {
            ws.sendMessage(sender.session, ErrorMessages.INTERNAL_SERVER_ERROR);
            log.error("Failed to create service of type {}.", messageType.getName());
        }

    }
}