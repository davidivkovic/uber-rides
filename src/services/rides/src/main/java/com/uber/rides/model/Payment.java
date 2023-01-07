package com.uber.rides.model;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import static com.uber.rides.util.Utils.gateway;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    String id;

    String captureUrl;
    boolean captured;
    LocalDateTime capturedAt;
    double amount;
    String currency;

    // nepotrebno
    @ManyToOne(fetch = FetchType.LAZY) PaymentMethod method;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    User user;
    @Column(name = "user_id", insertable = false, updatable = false)
    Long userId;

    String transactionId;

    public boolean capture() {
        var success = gateway
            .transaction()
            .submitForSettlement(this.transactionId)
            .isSuccess();
        if (success) {
            this.captured = true;
            this.capturedAt = LocalDateTime.now();
        }
        return success;
    }

    public boolean refund() {
        var voidResult = gateway.transaction().voidTransaction(this.transactionId);
        return voidResult.isSuccess();
    }
}