package com.uber.rides.ws.shared.messages.out;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.uber.rides.dto.TripDTO;
import com.uber.rides.ws.OutboundMessage;

@NoArgsConstructor
@AllArgsConstructor
public class SyncStatus implements OutboundMessage {
    
    public TripDTO trip;
    public boolean isOnline;

    @Override
    public String messageType() { return "SYNC_STATUS"; }

}