package com.uber.rides.model;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.MappedSuperclass;

import com.braintreegateway.Customer;
import com.braintreegateway.CustomerRequest;
import com.braintreegateway.PaymentMethod;
import com.braintreegateway.PaymentMethodRequest;
import com.braintreegateway.Result;
import com.uber.rides.controller.Payments;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Payment {

    @Getter
    @Setter
    @MappedSuperclass
    public abstract static class Method {

        public static final String TYPE = "GENERIC_PAYMENT_METHOD";
        String token;

        public boolean setAsDefault(User user) {
            if (user.getCustomerId() == null)
                return false;

            PaymentMethodRequest updateRequest = new PaymentMethodRequest()
                    .options()
                    .makeDefault(true)
                    .done();

            Result<? extends PaymentMethod> result = Payments.gateway.paymentMethod().update(token, updateRequest);
            return result.isSuccess();
        }

        public boolean vault(User user, String nonce) {
            if (user.getCustomerId() == null) {
                CustomerRequest braintreeRequest = new CustomerRequest()
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .paymentMethodNonce(nonce);

                Result<Customer> result = Payments.gateway.customer().create(braintreeRequest);

                if (!result.isSuccess()) {
                    return false;
                }
                user.setCustomerId(result.getTarget().getId());
                token = result.getTarget().getPaymentMethods().get(0).getToken();

            } else {
                var customerId = user.getCustomerId();
                PaymentMethodRequest braintreeRequest = new PaymentMethodRequest()
                        .customerId(customerId)
                        .paymentMethodNonce(nonce);

                Result<? extends PaymentMethod> result = Payments.gateway.paymentMethod().create(braintreeRequest);
                if (!result.isSuccess()) {
                    return false;
                }
                token = result.getTarget().getToken();
            }
            return true;
        }
        
        public void remove() {
            Payments.gateway.paymentMethod().delete(token);
        }

        boolean authorize(double amount, String currency) {
            return true;
        }
        boolean capture(String token) {
            return true;
        }
        boolean cancel(String token) {
            return true;
        }
    }

    @Id
    String id;

    String captureUrl;
    boolean captured;
    LocalDateTime capturedAt;
    double amount;
    String currency;

    @Embedded
    Method method;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    User user;
    @Column(name = "user_id", insertable = false, updatable = false)
    Long userId;

}