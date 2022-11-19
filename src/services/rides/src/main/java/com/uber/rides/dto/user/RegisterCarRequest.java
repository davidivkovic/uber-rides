package com.uber.rides.dto.user;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import com.uber.rides.model.Car;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterCarRequest {

    @NotNull Long userId;
    @NotNull @Min(2012) @Max(2023) short year;
    @NotBlank String registration;
    @NotBlank String make;
    @NotBlank String model;
    @NotNull Car.Types type;

}
