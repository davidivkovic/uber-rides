package com.uber.rides.ws.driver.messages.out;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import com.uber.rides.ws.OutboundMessage;

@NoArgsConstructor
@AllArgsConstructor
public class Fatigue implements OutboundMessage {
    
    public boolean isFatigued;
    public double minutesFatigue;
    public LocalDateTime fatigueEnd;

    @Override 
    public String messageType() { return "FATIGUE"; }
    
}