package com.uber.rides.ws.rider.messages.out;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import com.uber.rides.model.Car;
import com.uber.rides.ws.OutboundMessage;

@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CarLocation implements OutboundMessage  {
    
    public String registration;
    public Car.Types type;
    public double latitude;
    public double longitude;
    public double driverDuration;
    public double driverDistance;
    public double heading;

    @Override
    public String messageType() { return "CAR_LOCATION"; }

    public CarLocation(String registration) {
        this.registration = registration;
        this.latitude = 0;
        this.longitude = 0;
    }

}
