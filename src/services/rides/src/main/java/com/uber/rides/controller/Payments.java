package com.uber.rides.controller;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Base64;
import java.util.Objects;
import java.util.stream.Stream;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;

import com.braintreegateway.BraintreeGateway;
import com.braintreegateway.ClientTokenRequest;
import com.braintreegateway.CustomerRequest;
import com.braintreegateway.Environment;

import static com.speedment.jpastreamer.streamconfiguration.StreamConfiguration.*;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.braintreegateway.Customer;
import com.braintreegateway.Result;
import com.uber.rides.database.DbContext;
import com.uber.rides.dto.user.NewCardRequest;
import com.uber.rides.model.Card;
import com.uber.rides.model.Paypal;
import com.uber.rides.model.User;
import com.uber.rides.model.User.Roles;
import com.uber.rides.model.User$;

import static com.uber.rides.util.Utils.*;

@RestController
@RequestMapping("/payments")
public class Payments extends Controller {
    
    @PersistenceContext EntityManager db;
	@Autowired DbContext context;

    public static final String STATIC_PR_KEY = new String(Base64.getDecoder().decode(BT_PR_KEY_STATIC), StandardCharsets.UTF_8);
    public static final String STATIC_PU_KEY = new String(Base64.getDecoder().decode(BT_PU_KEY_STATIC), StandardCharsets.UTF_8);
    public static final String STATIC_TOKEN = new String(Base64.getDecoder().decode(BT_TOKEN_STATIC), StandardCharsets.UTF_8);

    private static BraintreeGateway gateway = new BraintreeGateway(
        Environment.SANDBOX,
        STATIC_TOKEN,
        STATIC_PU_KEY,
        STATIC_PR_KEY
    );

    @Secured({ Roles.RIDER })
    @GetMapping("/token")
    public String generatePaypalToken() {
        var user = db.find(User.class, authenticatedUserId());
        if(user.getPaypal() != null) {
            ClientTokenRequest clientTokenRequest = new ClientTokenRequest().customerId(user.getPaypal().getId());
            return gateway.clientToken().generate(clientTokenRequest);
        }
        return gateway.clientToken().generate();
    }

    @Transactional
    @PostMapping("methods/paypal")
    @Secured({ Roles.RIDER })
    public Object savePaypal(@RequestParam String nonce, @RequestParam String email) {
        var user = db.find(User.class, authenticatedUserId());
        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        if(user.getPaypal() != null) {
            return badRequest("You have already saved paypal as a payment method");
        }

        var request = new CustomerRequest()
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .paymentMethodNonce(nonce);

        Result<Customer> result = gateway.customer().create(request);

        if(!result.isSuccess()) {
            return badRequest("Something went wrong, please try again later");
        }
        var paypal = new Paypal();
        paypal.setId(result.getTarget().getId());
        paypal.setEmail(email);

        user.setPaypal(paypal);
        db.persist(paypal);

        return ok();
    }

    @Transactional
    @GetMapping("/methods")
    @Secured({ Roles.RIDER })
    public Object getPaymentMethods() {
        var user = context.readonlyQuery().stream(
                of(User.class)
                .joining(User$.paypal)
                .joining(User$.cards)
            )
            .filter(User$.id.equal(authenticatedUserId()))
            .findFirst()
            .orElse(null);

        if (user == null) return badRequest(USER_NOT_EXIST);

        return Stream.concat(
            Stream.of(user.getPaypal()),
            user.getCards().stream()
        )
        .filter(Objects::nonNull)
        .toList();
    }
    
    @Transactional
    @PostMapping("methods/{id}/remove")
    @Secured({ Roles.RIDER })
    public Object deletePaypal() {

        var user = context.query().stream(
            of(User.class)
            .joining(User$.cards)
            .joining(User$.paypal)
        )
        .filter(User$.id.equal(authenticatedUserId()))
        .findFirst()
        .orElse(null);
        
        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        Stream.concat(
            Stream.of(user.getPaypal()),
            user.getCards().stream()
        )
        .filter(Objects::nonNull)
        .forEach(m -> {
            if (m instanceof Paypal) {
                user.setPaypal(null);
                db.remove(m);
            }
            else if (m instanceof Card c) {
                user.removeCard(c.getId());
                db.remove(m);
            }
        });

        return ok();

    }

    @Transactional
    @PostMapping("methods/card")
    @Secured({ Roles.RIDER })
    public Object saveCard(@Validated @RequestBody NewCardRequest request) {

        if(request.getCardNumber().length() != 19) {
            return badRequest("The card number is invalid");
        }

        var user = db.find(User.class, authenticatedUserId());

        String[] parts = request.getExpirationDate().split("/");
        int month = Integer.parseInt(parts[0]);
        int year = Integer.parseInt("20" + parts[1]);
       
        try {
            LocalDate expirationDate = LocalDate.of(year, month, 1);
            if(expirationDate.isBefore(LocalDate.now())) {
                return badRequest("The card has expired");
            }
            var card = Card
            .builder()
            .cardNumber(request.getCardNumber())
            .nickname(request.getNickname())
            .cvv(request.getCvv())
            .country(request.getCountry())
            .expirationDate(expirationDate)
            .build();
    
            user.addCard(card);
            db.persist(user);
            return ok(card);

        } catch (Exception e) {
            return badRequest("Invalid date format");
        }
    }

}
