package com.uber.rides.ws.driver.messages.in;

import lombok.Getter;
import lombok.Setter;

import org.springframework.stereotype.Service;

import com.uber.rides.ws.InboundMessage;
import com.uber.rides.ws.driver.DriverData;

@Service
@Getter
@Setter
public class UpdateLocation implements InboundMessage<DriverData> {

    public static final String TYPE = "UPDATE_LOCATION";

    public double latitude;
    public double longitude;
    public double duration;
    public double distance;

    @Override
    public void handle(DriverData sender) {
        
        var car = sender.getUser().getCar();
        if (car == null) return;

        var heading = Math.toDegrees(Math.atan2(
            getLongitude() - sender.getLongitude(),
            getLatitude() - sender.getLatitude()
        ));

        sender.setLongitude(getLongitude());
        sender.setLatitude(getLatitude());
        sender.setHeading(heading);
        sender.setDuration(getDuration());
        sender.setDistance(getDistance());

    }

}