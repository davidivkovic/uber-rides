package com.uber.rides.ws.driver.messages.in;

import lombok.Getter;
import lombok.Setter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uber.rides.ws.WS;
import com.uber.rides.ws.InboundMessage;
import com.uber.rides.ws.driver.DriverData;

@Service
@Getter
@Setter
public class UpdateLocation implements InboundMessage<DriverData> {

    public static final String TYPE = "UPDATE_LOCATION";

    public double latitude;
    public double longitude;

    @Autowired WS ws;

    @Override
    public void handle(DriverData sender) {
        
        var car = sender.getUser().getCar();
        if (car == null) return;

        var heading = Math.toDegrees(Math.atan2(
            longitude - sender.getLongitude(),
            latitude - sender.getLatitude())
        );

        sender.setLongitude(longitude);
        sender.setLatitude(latitude);
        sender.setHeading(heading);

    }

}