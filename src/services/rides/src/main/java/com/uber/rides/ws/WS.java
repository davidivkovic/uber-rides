package com.uber.rides.ws;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import javax.persistence.EntityManagerFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.jsonwebtoken.Claims;

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
import com.uber.rides.ws.admin.AdminData;
import com.uber.rides.ws.driver.DriverData;
import com.uber.rides.ws.rider.RiderData;

import static com.uber.rides.Utils.*;

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
    @Autowired EntityManagerFactory contextFactory;

    public Map<Long, DriverData> drivers = new ConcurrentHashMap<>();
    public Map<Long, RiderData> riders = new ConcurrentHashMap<>();
    public Map<Long, UserData> admins = new ConcurrentHashMap<>();

    Logger logger = LoggerFactory.getLogger(WS.class);

    @Override
    @Transactional
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {

        var userId = (Long) session.getAttributes().get(USER_ID);
        var user = contextFactory.createEntityManager().find(User.class, userId);

        if (user == null) {
            session.close();
            return;
        }

        switch (user.getRole()) {
            case Roles.ADMIN -> admins.put(userId, new AdminData(user, session));
            case Roles.DRIVER -> drivers.put(userId, new DriverData(user, session));
            default -> riders.put(userId, new RiderData(user, session));
        }

        super.afterConnectionEstablished(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        /*  
            Payload:
            MESSAGE_TYPE\n
            Json String
        */
        var tokens = message.getPayload().split("\\\\n");
        if (tokens.length == 2) {
            var collection = switch ((String) session.getAttributes().get(USER_ROLE)) {
                case Roles.ADMIN -> admins;
                case Roles.DRIVER -> drivers;
                default -> riders;
            };
            var userData = collection.get(session.getAttributes().get(USER_ID));
            messageHandler.handle(userData, tokens[0], tokens[1]);
        } else {
            sendMessage(session, ErrorMessages.MALFORMED);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        drivers.remove(session.getAttributes().get(USER_ID));
        super.afterConnectionClosed(session, status);
    }

    public void sendMessageToUser(Long driverId, String message) {
        var data = drivers.get(driverId);
        if (data != null) {
            sendMessage(data.session, message);
        }
    }

    public void broadcast(String role, String message) {

        var iterator = switch (role) {
            case Roles.ADMIN -> admins.values().iterator();
            case Roles.DRIVER -> drivers.values().iterator();
            default -> riders.values().iterator();
        };

        while (iterator.hasNext()) {
            var data = iterator.next();
            if (data != null) {
                sendMessage(data.session, message);
            }
        }
    }

    public Trip getCurrentTrip(User user) {   

        if (user.getRole().equals(Roles.DRIVER)) return Optional
            .ofNullable(drivers.get(user.getId()))
            .map(DriverData::getCurrentTrip)
            .orElse(null);

        else return Optional
            .ofNullable(riders.get(user.getId()))
            .map(RiderData::getCurrentTrip)
            .orElse(null);
        
    }

}