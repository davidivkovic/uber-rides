package com.uber.rides.ws;

import static com.uber.rides.util.Utils.*;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

import javax.persistence.EntityManagerFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.jsonwebtoken.Claims;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
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

import com.uber.rides.model.Trip;
import com.uber.rides.model.User;
import com.uber.rides.model.User.Roles;
import com.uber.rides.security.JWT;
import com.uber.rides.ws.driver.DriverData;
import com.uber.rides.ws.rider.RiderData;

@Configuration
@EnableWebSocket
class WSConfig implements WebSocketConfigurer {

    @Autowired WS handler;

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

                    attributes.put(USER_ID, Long.parseLong(jwt.getSubject()));
                    attributes.put(USER_ROLE, jwt.get(JWT.ROLE_CLAIM, String.class));
                    
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
}

@Component
public class WS extends TextWebSocketHandler {

    @Autowired MessageHandler messageHandler;
    @Autowired EntityManagerFactory dbFactory;
    @Autowired Store store;

    Logger logger = LoggerFactory.getLogger(WS.class);

    @Override
    @Transactional
    public void afterConnectionEstablished(WebSocketSession session) {

        var userId = (Long) session.getAttributes().get(USER_ID);
        try {
            var db = dbFactory.createEntityManager();
            var user = db.find(User.class, userId);
            db.close();

            if (user == null) {
                session.close(CloseStatus.NOT_ACCEPTABLE);
                return;
            }
            if (store.get(user.getId()) == null) {
                store.put(user, session);
                var userData = store.get(user.getId());
                if (userData != null) userData.onConnected();
            }
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
        if (tokens.length == 2) {
            var userData = store.get((Long) session.getAttributes().get(USER_ID));
            if (userData != null) {
                messageHandler.handle(userData, tokens[0], tokens[1]);
            } 
            else { sendMessage(session, ErrorMessages.DISCONNECTED);  }
        } 
        else { sendMessage(session, ErrorMessages.MALFORMED); }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        var userData = store.get((Long) session.getAttributes().get(USER_ID));
        if (userData != null) {
            userData.onDisconnected();
            store.remove(userData.getUser().getId());
        }
        try { session.close(); } 
        catch (IOException e) { /* Ignore */}
        try { super.afterConnectionClosed(session, status); }
        catch (Exception e) { /* Ignore */ }
    }

    public static void sendMessage(WebSocketSession session, String message) {
        sendMessage(session, new TextMessage(message));
    }

    public static void sendMessage(WebSocketSession session, TextMessage message) {
        if (session != null && session.isOpen()) {
            try { session.sendMessage(message); }
            catch (IOException e) { /* Nothing special */ }
        }
    }

    public void sendMessageToUser(Long userId, OutboundMessage message) {
        var data = store.get(userId);
        if (data == null) return;
        try { sendMessage(data.session, message.serialize()); }
        catch (JsonProcessingException e) { 
            logger.error("Could not serialize message of type {}", message.getClass()); 
        }
    }

    public void sendMessageToUser(Long userId, String message) {
        var data = store.get(userId);
        if (data != null) {
            sendMessage(data.session, message);
        }
    }

    public void broadcast(String role, OutboundMessage message) {
        try { broadcast(role, message.serialize()); } 
        catch (JsonProcessingException e) {
            logger.error("Could not serialize message of type {}", message.getClass()); 
        }
    }

    public void broadcast(String role, String message) {
        var iterator = store.getMap(role).values().iterator();
        while (iterator.hasNext()) {
            var data = iterator.next();
            if (data != null) {
                sendMessage(data.session, message);
            }
        }
    }

    public Trip getCurrentTrip(User user) {   

        if (user.getRole().equals(Roles.DRIVER)) return Optional
            .ofNullable(store.drivers.get(user.getId()))
            .map(DriverData::getCurrentTrip)
            .orElse(null);

        else return Optional
            .ofNullable(store.riders.get(user.getId()))
            .map(RiderData::getCurrentTrip)
            .orElse(null);
        
    }
    

}