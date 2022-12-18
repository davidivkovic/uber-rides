package com.uber.rides.controller;

import java.time.LocalDate;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;
import javax.validation.constraints.NotBlank;

import com.braintreegateway.ClientTokenRequest;

import static com.speedment.jpastreamer.streamconfiguration.StreamConfiguration.*;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.uber.rides.database.DbContext;
import com.uber.rides.dto.user.NewCardRequest;
import com.uber.rides.model.Card;
import com.uber.rides.model.Paypal;
import com.uber.rides.model.User;
import com.uber.rides.model.User.Roles;
import com.uber.rides.util.Utils;
import com.uber.rides.model.User$;

import static com.uber.rides.util.Utils.*;

@RestController
@RequestMapping("/payments")
public class Payments extends Controller {

    @PersistenceContext EntityManager db;

    @Autowired DbContext context;

    @Secured({ Roles.RIDER })
    @GetMapping("/token")
    public String generatePaypalToken() {
        var user = context.readonlyQuery().stream(
                of(User.class)
                        .joining(User$.paypal))
                .filter(User$.id.equal(authenticatedUserId()))
                .findFirst()
                .orElse(null);

        if (user == null) {
            return "";
        }

        if (user.getCustomerId() != null && user.getPaypal() != null) {
            ClientTokenRequest clientTokenRequest = new ClientTokenRequest().customerId(user.getCustomerId());
            return Utils.gateway.clientToken().generate(clientTokenRequest);
        }
        return gateway.clientToken().generate();
    }

    @Transactional
    @PostMapping("methods/paypal")
    @Secured({ Roles.RIDER })
    public Object savePaypal(@RequestParam String nonce, @RequestParam String email) {
        var user = context.query().stream(
                of(User.class)
                        .joining(User$.paypal))
                .filter(User$.id.equal(authenticatedUserId()))
                .findFirst()
                .orElse(null);

        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        if (user.getPaypal() != null) {
            return badRequest("You have already saved paypal as a payment method");
        }

        var paypal = new Paypal();
        var success = paypal.vault(user, nonce);
        if (!success)
            return badRequest("Something went wrong, please try again later");

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
                        .joining(User$.cards))
                .filter(User$.id.equal(authenticatedUserId()))
                .findFirst()
                .orElse(null);

        if (user == null)
            return badRequest(USER_NOT_EXIST);

        return Stream.concat(
                Stream.of(user.getPaypal()),
                user.getCards().stream())
                .filter(Objects::nonNull)
                .toList();
    }

    @Transactional
    @PostMapping("methods/{id}/remove")
    @Secured({ Roles.RIDER })
    public Object deletePaypal(@PathVariable("id") @NotBlank Long methodId) {

        var user = context.query().stream(
                of(User.class)
                        .joining(User$.cards)
                        .joining(User$.paypal))
                .filter(User$.id.equal(authenticatedUserId()))
                .findFirst()
                .orElse(null);

        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        Stream.concat(
            Stream.of(user.getPaypal()),
            user.getCards().stream())
            .filter(Objects::nonNull)
            .collect(Collectors.toList())
            .forEach(m -> {
                if (m.getType().equals("Paypal") && ((Paypal)m).getId().equals(methodId)) {
                    user.setPaypal(null);
                    m.remove(user);
                    db.remove(m);

                } else if (m.getType().equals("Card") && ((Card)m).getId().equals(methodId)) {
                    user.removeCard(((Card)m).getId());
                    m.remove(user);
                    db.remove(m);
                }
            });

        db.persist(user);
        return ok();

    }

    @Transactional
    @PostMapping("methods/card")
    @Secured({ Roles.RIDER })
    public Object saveCard(@Validated @RequestBody NewCardRequest request) {
        LocalDate expirationDate;
        try {
            expirationDate = LocalDate.of(request.getYear(), request.getMonth(), 1);
            if (expirationDate.isBefore(LocalDate.now())) {
                return badRequest("The card has expired");
            }
        } catch (Exception e) {
            return badRequest("Invalid date format");
        }

        var user = db.find(User.class, authenticatedUserId());

        var card = new Card();
        var success = card.vault(user, request.getNonce());
        if (!success)
            return badRequest("Make sure card data is valid.");
       
        card.setCardNumber(request.getCardNumber());
        card.setNickname(request.getNickname());
        card.setCvv(request.getCvv());
        card.setCountry(request.getCountry());
        card.setExpirationDate(expirationDate);

        user.addCard(card);
        db.persist(card);
        db.persist(user);

        return ok(card);
    }

    // @Transactional
    // @PostMapping("/pay")
    // @Secured({ Roles.RIDER })
    // public Object payWithPaypal(@Validated @RequestBody NewPaymentRequest paymentRequest) {
    //     TransactionRequest request = new TransactionRequest()
    //     .amount(new BigDecimal(paymentRequest.getAmount()))
    //     .paymentMethodNonce(paymentRequest.getNonce())
    //     .options()
    //     .storeInVaultOnSuccess(true)
    //     .submitForSettlement(true)
    //     .done();

    //     Result<Transaction> result = gateway.transaction().sale(request);
    //     if (!result.isSuccess()) {
    //     return badRequest("Payment was unsucessfull");

    //     }

    //     var user = db.find(User.class, authenticatedUserId());

    //     var paypal = new Paypal();
    //     paypal.setCustomerId(result.getTarget().getCustomer().getId());
    //     paypal.setEmail(paymentRequest.getEmail());

    //     user.setPaypal(paypal);
    //     db.persist(paypal);

    //     save payment to db

    //     return ok();
    // }

}
