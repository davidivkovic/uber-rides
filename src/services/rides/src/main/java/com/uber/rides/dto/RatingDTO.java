package com.uber.rides.dto;

import lombok.Getter;
import lombok.Setter;

import com.uber.rides.model.Rating;
import static com.uber.rides.util.Utils.mapper;

@Getter
@Setter
public class RatingDTO {

    static {
        mapper
        .typeMap(Rating.class, RatingDTO.class)
        .addMappings(mapper -> mapper.map(Rating::getUserId, RatingDTO::setUserId));
    }
    
    Long id;
    Long userId;
    double rating;
    String comment;

}
