package com.uber.rides.model;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.braintreegateway.BraintreeGateway;
import com.braintreegateway.Result;
import com.braintreegateway.Transaction;
import com.braintreegateway.TransactionGateway;
import com.braintreegateway.ValidationErrors;
import com.uber.rides.util.Utils;


public class PaymentTests {

    @Mock
    TransactionGateway transactionGateway;

    @Mock
    private Result<Transaction> result;

    @InjectMocks
    private Payment payment;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);

        payment.setAmount(50);
        payment.setTransactionId("TransactionId");

        Utils.gateway = mock(BraintreeGateway.class);

        transactionGateway = mock(TransactionGateway.class);
        when(Utils.gateway.transaction()).thenReturn(transactionGateway);

    }

    @Test
    public void testCapture_fail_returnsFalse() {
        var result = new Result<Transaction>(new ValidationErrors());
        when(transactionGateway.submitForSettlement(payment.transactionId)).thenReturn(result);

        var success = payment.capture();

        assertFalse(success);

        // assert that the payment wasn't captured
        assertFalse(payment.isCaptured());
        assertNull(payment.getCapturedAt());
    }

    @Test
    public void testCapture_success_setsCaptureTime() {
        var result = new Result<Transaction>();
        when(transactionGateway.submitForSettlement(payment.transactionId)).thenReturn(result);

        var success = payment.capture();

        assertTrue(success);

        // assert that the payment was captured
        assertTrue(payment.isCaptured());
        assertNotNull(payment.getCapturedAt());
    }

    @Test
    public void testRefund_fail_returnsFalse() {
        var result = new Result<Transaction>(new ValidationErrors());
        when(transactionGateway.voidTransaction(payment.getTransactionId())).thenReturn(result);
        
        var success = payment.refund();

        assertFalse(success);
    }

    @Test
    public void testRefund_success_returnsTrue() {
        var result = new Result<Transaction>();
        when(transactionGateway.voidTransaction(payment.getTransactionId())).thenReturn(result);

        var success = payment.refund();

        assertTrue(success);
    }
}