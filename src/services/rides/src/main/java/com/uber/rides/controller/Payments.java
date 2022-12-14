package com.uber.rides.controller;

import org.springframework.web.bind.annotation.RestController;

import com.braintreegateway.BraintreeGateway;
import com.braintreegateway.ClientTokenRequest;
import com.braintreegateway.CustomerRequest;
import com.braintreegateway.Environment;

import com.braintreegateway.Customer;
import com.braintreegateway.Result;
import com.uber.rides.database.DbContext;
import com.uber.rides.dto.user.NewCardRequest;
import com.uber.rides.model.Card;
import com.uber.rides.model.Paypal;
import com.uber.rides.model.User;
import com.uber.rides.model.User.Roles;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;
import javax.validation.constraints.NotBlank;

import static com.speedment.jpastreamer.streamconfiguration.StreamConfiguration.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Base64;
import java.util.Collection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

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
        else {
            return gateway.clientToken().generate();
        }
    }

    @Transactional
    @PostMapping("/paypal")
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
    @GetMapping("/paypal")
    @Secured({ Roles.RIDER })
    public Object getPaypal() {
        var user = context.readonlyQuery().stream(
                of(User.class)
                .joining(User$.paypal)
            )
            .filter(User$.id.equal(authenticatedUserId()))
            .findFirst()
            .orElse(null);

        if (user == null) return badRequest(USER_NOT_EXIST);

        return user.getPaypal();
    }
    
    @Transactional
    @PostMapping("/paypal/remove")
    @Secured({ Roles.RIDER })
    public Object deletePaypal() {
        var user = db.find(User.class, authenticatedUserId());
        var paypal = user.getPaypal();

        if(paypal == null) {
            return badRequest("The user doesn't have paypal as a saved payment method");
        }

        user.setPaypal(null);
        db.remove(paypal);

        return ok();
    }

    @Transactional
    @PostMapping("/card")
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
            var card = new Card();
            card.setCardNumber(request.getCardNumber());
            card.setNickname(request.getNickname());
            card.setCvv(request.getCvv());
            card.setCountry(request.getCountry());
            card.setExpirationDate(expirationDate);
    
            user.addCard(card);
            db.persist(user);
            return ok(card);

        } catch (Exception e) {
            return badRequest("Invalid date format");
        }
    }

    @Transactional
    @GetMapping("/cards")
    @Secured({ Roles.RIDER })
    public Object getCards() {
        return context.readonlyQuery().stream(
                of(User.class)
                .joining(User$.cards)
            )
            .filter(User$.id.equal(authenticatedUserId()))
            .map(User::getCards)
            .flatMap(Collection::stream)
            .toList();            
    }

    @Transactional
    @PostMapping("/cards/{id}/remove")
    @Secured({ Roles.RIDER })
    public Object removeCard(@PathVariable("id") @NotBlank Long cardId) {
        var user = context.query().stream(
            of(User.class)
            .joining(User$.cards)
        )
        .filter(User$.id.equal(authenticatedUserId()))
        .findFirst()
        .orElse(null);
        
        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        user.removeCard(cardId);

        return ok();
    }
}
