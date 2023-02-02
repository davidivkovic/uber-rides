package com.uber.rides.ws;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.jsonwebtoken.Claims;

import com.fasterxml.jackson.core.JsonProcessingException;

import com.speedment.jpastreamer.application.JPAStreamer;

import static com.speedment.jpastreamer.streamconfiguration.StreamConfiguration.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.event.EventListener;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.uber.rides.model.*;
import com.uber.rides.model.User.Roles;
import com.uber.rides.security.JWT;
import com.uber.rides.simulator.DriverSimulator;

import static com.uber.rides.util.Utils.*;

@Configuration
@EnableWebSocket
class WSConfig implements WebSocketConfigurer {

    @Autowired WS handler;
    @Autowired DriverSimulator simulator;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry
        .addHandler(handler, "/ws")
        .setAllowedOriginPatterns("*")
        .addInterceptors(new HandshakeInterceptor() {

            @Override
            public boolean beforeHandshake(
                ServerHttpRequest serverRequest, ServerHttpResponse response,
                WebSocketHandler wsHandler, Map<String, Object> attributes
            ) throws Exception {
                if (serverRequest instanceof ServletServerHttpRequest request) {
                    var token = request.getServletRequest().getParameter("token");
                    Claims jwt = JWT.parseJWT(token);
                    if (jwt.getSubject() == null) return false;

                    var isSim = request.getServletRequest().getParameter("sim");

                    attributes.put(USER_ID, Long.parseLong(jwt.getSubject()));
                    attributes.put(USER_ROLE, jwt.get(JWT.ROLE_CLAIM, String.class));
                    attributes.put("IS_SIM", isSim != null && isSim.equals("true"));
                    
                    return true;
                }
                return false;
            }

            @Override
            public void afterHandshake(
                ServerHttpRequest request, ServerHttpResponse response,
                WebSocketHandler wsHandler, Exception exception
            ) { /* Not needed */ }
            
        });
    }

    @EventListener(ApplicationReadyEvent.class)
    public void applicationReady() {
        simulator.start(3);
    }

}

@Component
public class WS extends TextWebSocketHandler {

    @Autowired MessageHandler messageHandler;
    @Autowired JPAStreamer query;
    @Autowired ThreadPoolTaskScheduler scheduler;
    @Autowired Store store;
    @Autowired @Lazy DriverSimulator simulator;

    Logger logger = LoggerFactory.getLogger(WS.class);

    @Override
    @Transactional
    public void afterConnectionEstablished(WebSocketSession session) {

        var userId = (Long) session.getAttributes().get(USER_ID);
        try {
            var user = query.stream(
                of(User.class)
                .joining(User$.car)
            )
            .filter(User$.id.equal(userId))
            .findFirst()
            .orElse(null);

            if (user == null) {
                session.close(CloseStatus.NOT_ACCEPTABLE);
                return;
            }

            var isSim = ((boolean) session.getAttributes().get("IS_SIM"));
            var userData = store.get(user.getId());
            if (userData == null) {
                userData = store.put(user, session);
                if (user.getRole().equals(Roles.DRIVER)) {
                    if (isSim) userData.setSim(isSim);
                    else if (user.getCurrentTrip() == null) {
                        var s = simulator.connectToWs(user);
                        if (s != null) simulator.runTask(user);
                    }
                }
            }
            else if (!isSim) {
                userData.setSession(session);
                userData.setSim(false);
            }

            userData.onConnected();
            super.afterConnectionEstablished(session);
        }
        catch (Exception e) {
            store.remove(userId);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        /*  
            Payload:
            MESSAGE_TYPE\n
            Json String
        */
        var tokens = message.getPayload().split("\n");
        if (tokens.length != 2 || tokens[0] == null) {
            sendMessage(session, ErrorMessages.MALFORMED);
            return;
        }
        var userData = store.get((Long) session.getAttributes().get(USER_ID));
        if (userData == null ) {
            sendMessage(session, ErrorMessages.DISCONNECTED);
            return;
        } 
        messageHandler.handle(userData, tokens[0], tokens[1]);
    }

    @Override
    @Transactional
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        var userData = store.get((Long) session.getAttributes().get(USER_ID));
        if (userData != null) {
            userData.onDisconnected();
            userData.setSession(null);
            // scheduler.schedule(
            //     () -> {
            //         if (userData.getSession() != null && userData.getSession().isOpen()) return;
            //         store.remove(userData.getUser().getId());
            //     }, 
            //     Instant.now().plusSeconds(300)
            // );
        }
        try { super.afterConnectionClosed(session, status); }
        catch (Exception e) { /* Ignore */ }
    }

    public void sendMessage(WebSocketSession session, String message) {
        sendMessage(session, new TextMessage(message));
    }

    public void sendMessage(WebSocketSession session, TextMessage message) {
        if (session == null) return;
        var userData = store.get((Long) session.getAttributes().get(USER_ID));
        if (userData != null && userData.session.isOpen()) {
            try { userData.session.sendMessage(message); }
            catch (IOException e) { 
                logger.warn("Could not send message to user {}", userData.getUser().getId());
            }
        }
    }

    public void sendMessageToUser(Long userId, OutboundMessage message) {
        var data = store.get(userId);
        if (data == null || data.session == null) return;
        try { synchronized (data.session) { sendMessage(data.session, message.serialize()); } }
        catch (JsonProcessingException e) { 
            logger.error("Could not serialize message of type {}", message.getClass()); 
        }
    }

    public void sendMessageToUser(Long userId, String message) {
        var data = store.get(userId);
        if (data != null && data.session != null) {
            synchronized (data.session) { sendMessage(data.session, message); }
        }
    }

    public Trip getCurrentTrip(User user) {   

        if (user.getRole().equals(Roles.DRIVER)) return Optional
            .ofNullable(store.drivers.get(user.getId()))
            .map(d -> d.getUser().getCurrentTrip())
            .orElse(null);

        else return Optional
            .ofNullable(store.riders.get(user.getId()))
            .map(r -> r.getUser().getCurrentTrip())
            .orElse(null);
        
    }
    

}