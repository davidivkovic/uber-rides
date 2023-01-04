package com.uber.rides.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.braintreegateway.CustomerRequest;
import com.braintreegateway.PaymentMethodRequest;
import com.braintreegateway.Result;
import com.braintreegateway.Transaction;
import com.braintreegateway.TransactionRequest;

import static com.uber.rides.util.Utils.gateway;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentMethod {

    public enum Type {
        CARD, PAYPAL;

        @Override
        public String toString() {
            switch(this) {
                case CARD: return "Credit or debit card";
                case PAYPAL: return "PayPal";
                default: return "";
              }
        }

    }

    public String getTypeName() {
        return this.type.toString();
    }

    @Id @GeneratedValue Long id;
    String token;
    Type type;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    User user;
    @Column(name = "user_id", insertable = false, updatable = false)
    Long userId;

    /* Paypal info */
    String email;

    /* Card Info */
    String cardNumber;
    String cvv;
    LocalDate expirationDate;
    String nickname; 
    String country;

    public short getYear() {
        return (short) expirationDate.getYear();
    }

    public short getMonth() {
        return (short) expirationDate.getMonthValue();
    }

    public boolean vault(String nonce) {
        if (user.getCustomerId() == null) {
            var braintreeRequest = new CustomerRequest()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .paymentMethodNonce(nonce);

            var result = gateway
                .customer()
                .create(braintreeRequest);

            if (!result.isSuccess()) {
                return false;
            }

            user.setCustomerId(result.getTarget().getId());
            token = result.getTarget().getPaymentMethods().get(0).getToken();

            return true;
        }

        var customerId = user.getCustomerId();
        var braintreeRequest = new PaymentMethodRequest()
            .customerId(customerId)
            .paymentMethodNonce(nonce);

        var result = gateway
            .paymentMethod()
            .create(braintreeRequest);

        if (!result.isSuccess()) {
            return false;
        }
        token = result.getTarget().getToken();
        return true;
    }
    
    public void remove() {
        gateway.paymentMethod().delete(token);
    }

    public Payment authorize(double amount, String currency) {
        TransactionRequest request = new TransactionRequest()
            .paymentMethodToken(this.token)
            .currencyIsoCode(currency)
            .amount(BigDecimal.valueOf(amount));
      
      Result<Transaction> result = gateway.transaction().sale(request);
      if(!result.isSuccess()) return null;

      return Payment.builder()
        .amount(amount)
        .currency(currency)
        .capturedAt(LocalDateTime.now())
        .transactionId(result.getTarget().getId())
        .build();
    }
}