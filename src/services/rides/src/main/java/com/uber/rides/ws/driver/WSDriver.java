package com.uber.rides.ws.driver;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import static com.uber.rides.Utils.*;

import com.uber.rides.ws.ErrorMessages;
import com.uber.rides.ws.MessageHandler;

@Configuration
@EnableWebSocket
class WSDriverConfig implements WebSocketConfigurer {

    @Autowired WSDriver handler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(handler, "/ws-driver").setAllowedOriginPatterns("*");
    }
}

@Component
public class WSDriver extends TextWebSocketHandler {

    @Autowired MessageHandler messageHandler;
    public Map<Long, DriverData> drivers = new ConcurrentHashMap<>();

    Logger logger = LoggerFactory.getLogger(WSDriver.class);

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        var driverId = new Date().getTime();
        session.getAttributes().put(USER_ID, driverId);
        drivers.put(driverId, new DriverData(driverId, session));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        /*  
            Payload:
            MESSAGE_TYPE\n
            Json String
        */
        var tokens = message.getPayload().split("\\\\n", 2);
        if (tokens.length == 2) {
            var driverData = drivers.get(session.getAttributes().get(USER_ID));
            messageHandler.handle(driverData, tokens[0], tokens[1]);
        } else {
            sendMessage(session, ErrorMessages.MALFORMED);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        drivers.remove(session.getAttributes().get(USER_ID));
    }

    void sendMessageToUser(Long driverId, String message) {
        var data = drivers.get(driverId);
        if (data != null) {
            sendMessage(data.session, message);
        }
    }
}