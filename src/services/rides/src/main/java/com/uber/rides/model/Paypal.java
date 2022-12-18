package com.uber.rides.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Paypal extends Payment.Method {

    public static final String TYPE = "PAYPAL";

    @Id @GeneratedValue Long id;

    String email;

    @Override
    public String getType() { return "Paypal"; }
}
