package com.uber.rides.ws.rider;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import static com.uber.rides.Utils.*;
import com.uber.rides.ws.driver.WSDriver;

@Configuration
@EnableWebSocket
class WSRiderConfig implements WebSocketConfigurer {

    @Autowired
    WSRider handler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(handler, "/ws-rider").setAllowedOriginPatterns("*");
    }
}

@Component
public class WSRider extends TextWebSocketHandler {

    @Autowired @Lazy
    WSDriver wsDriver;
    public Map<Long, RiderData> riders = new ConcurrentHashMap<>();

    // Logger logger = LoggerFactory.getLogger(WSRider.class);

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        var riderId = (long)new Random().nextInt(0, 1000);
        session.getAttributes().put(USER_ID, riderId);
        riders.put(riderId, new RiderData(riderId, session));
    }

    void sendMessageToUser(Long riderId, String message) {
        var data = riders.get(riderId);
        if (data != null) {
            sendMessage(data.session, message);
        }
    }

    public void broadcast(String message) {
        var iterator = riders.values().iterator();
        while (iterator.hasNext()) {
            var data = iterator.next();
            if (data != null) {
                sendMessage(data.session, message);
            }
        }
    }
}