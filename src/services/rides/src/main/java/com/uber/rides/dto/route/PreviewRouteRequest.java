package com.uber.rides.dto.route;

import java.time.LocalDateTime;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PreviewRouteRequest {
    
    @NotBlank String originPlaceId;
    @NotBlank String destinationPlaceId;
    @NotBlank String routingPreference;
    @Size(max = 3) String[] waypointPlaceIds;
    LocalDateTime scheduledAt;

}
