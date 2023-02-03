package com.uber.rides.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
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
import com.braintreegateway.TransactionRequest;
import com.braintreegateway.ValidationErrors;
import com.uber.rides.util.Utils;

public class PaymentMethodTests {

    @Mock
    TransactionGateway transactionGateway;
    
    @InjectMocks
    private PaymentMethod paymentMethod;

    Double amount = 50.0;
    String currency = "USD";
    User user = new User();
    User driver = new User();

    TransactionRequest transactionRequest;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);

        paymentMethod.setToken("payment-method-token");
        paymentMethod.setType(PaymentMethod.Type.PAYPAL);
        paymentMethod.setEmail("email@example.com");

        Utils.gateway = mock(BraintreeGateway.class);

        transactionGateway = mock(TransactionGateway.class);
        when(Utils.gateway.transaction()).thenReturn(transactionGateway);


        paymentMethod.setUser(user);

        driver.setId(1L);
        driver.setFirstName("John");
        driver.setLastName("Doe");
    }

    @Test
    public void testAuthorize_fail_returnsNull() {
        var result = new Result<Transaction>(new ValidationErrors());
        when(transactionGateway.sale(any())).thenReturn(result);

        var payment = paymentMethod.authorize(amount, currency, driver);

        assertNull(payment);
    }
    
    @Test
    public void testAuthorize_success_returnsPayment() {
        var transaction = mock(Transaction.class);
        var result = new Result<Transaction>(transaction);
        when(transactionGateway.sale(any())).thenReturn(result);
        when(transaction.getId()).thenReturn("transaction-id");

        var payment = paymentMethod.authorize(amount, currency, driver);

        assertNotNull(payment);

        // assert payment data correct
        assertEquals(amount, payment.getAmount());
        assertEquals(currency, payment.getCurrency());
        assertEquals(user, payment.getUser());
        assertEquals(driver, payment.getDriver());
        assertEquals( "transaction-id", payment.getTransactionId());
    }

}
