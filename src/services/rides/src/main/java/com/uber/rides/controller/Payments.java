package com.uber.rides.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;

import javax.transaction.Transactional;
import javax.validation.constraints.NotBlank;

import com.braintreegateway.ClientTokenRequest;

import static com.speedment.jpastreamer.streamconfiguration.StreamConfiguration.*;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.annotation.Secured;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.uber.rides.model.*;
import com.uber.rides.model.User.Roles;
import com.uber.rides.database.DbContext;
import com.uber.rides.dto.AnalyticsDTO;
import com.uber.rides.dto.user.NewCardRequest;
import com.uber.rides.dto.user.PaymentMethodDTO;

import static com.uber.rides.util.Utils.*;

@RestController
@RequestMapping("/payments")
public class Payments extends Controller {

    @Autowired DbContext context;

    @Transactional
    @Secured({ Roles.RIDER })
    @GetMapping("/token")
    public String generatePaypalToken() {
        var user = context.readonlyQuery()
            .stream(
                of(User.class)
                .joining(User$.paymentMethods)
            )
            .filter(User$.id.equal(authenticatedUserId()))
            .findFirst()
            .orElse(null);

        if (user == null) {
            return "";
        }

        if (
            user.getCustomerId() != null && 
            user.getPaymentMethods().stream().anyMatch(m -> m.getType().equals(PaymentMethod.Type.PAYPAL))
        ) {
            var clientTokenRequest = new ClientTokenRequest().customerId(user.getCustomerId());
            return gateway.clientToken().generate(clientTokenRequest);
        }

        return gateway.clientToken().generate();
    }

    @Transactional
    @GetMapping("/methods")
    @Secured({ Roles.RIDER })
    public Object getPaymentMethods() {
        var user = context.query()
        .stream(
            of(User.class)
            .joining(User$.defaultPaymentMethod)
            .joining(User$.paymentMethods)
        )
        .filter(User$.id.equal(authenticatedUserId()))
        .findFirst()
        .orElse(null);

        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        var methods = user.getPaymentMethods().stream()
            .map(method -> mapper.map(method, PaymentMethodDTO.class))
            .toList();

        methods.forEach(method -> method.setDefault(method.getId().equals(user.getDefaultPaymentMethod().getId())));

        return methods;
    }

    @Transactional
    @PostMapping("methods/paypal")
    @Secured({ Roles.RIDER })
    public Object savePaypal(@RequestParam String nonce, @RequestParam String email, @RequestParam Boolean setDefault) {
        var user = context.query()
            .stream(
                of(User.class)
                .joining(User$.paymentMethods)
                .joining(User$.defaultPaymentMethod)
            )
            .filter(User$.id.equal(authenticatedUserId()))
            .findFirst()
            .orElse(null);

        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        if (user.getPaymentMethods().stream().anyMatch(m -> m.getType().equals(PaymentMethod.Type.PAYPAL))) {
            return badRequest("You have already saved paypal as a payment method.");
        }

        var paypal = PaymentMethod.builder()
            .type(PaymentMethod.Type.PAYPAL)
            .user(user)
            .email(email)
            .build();

        var success = paypal.vault(nonce);
        if (!success) return badRequest("Something went wrong, please try again later.");

        user.addPaymentMethod(paypal);
        if(user.getDefaultPaymentMethod() == null || setDefault) {
            user.setDefaultPaymentMethod(paypal);
            user.setDefaultPmt(PaymentMethod.Type.PAYPAL);
        }
        
        context.db().persist(paypal);
        context.db().merge(user);
        return ok();
    }

    @Transactional
    @PostMapping("methods/{id}/remove")
    @Secured({ Roles.RIDER })
    public Object removePaymentMethod(@PathVariable("id") @NotBlank Long methodId) {

        var user = context.query()
            .stream(
                of(User.class)
                .joining(User$.paymentMethods)
                .joining(User$.defaultPaymentMethod)
            )
            .filter(User$.id.equal(authenticatedUserId()))
            .findFirst()
            .orElse(null);

        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        var paymentMethod = user.getPaymentMethods().stream()
            .filter(method -> method.getId().equals(methodId))
            .findFirst().
            orElse(null);

        user.removePaymentMethod(methodId);

        if (user.getDefaultPaymentMethod() != null && user.getDefaultPaymentMethod().getId().equals(methodId)) {
            if (user.getPaymentMethods().isEmpty()) {
                user.setDefaultPaymentMethod(null);
                user.setDefaultPmt(PaymentMethod.Type.NONE);
            }
            else {
                user.setDefaultPaymentMethod(user.getPaymentMethods().get(0));
                user.setDefaultPmt(user.getPaymentMethods().get(0).getType());
            }
        }

        context.db().remove(paymentMethod);
        context.db().merge(user);
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
                return badRequest("The card has expired.");
            }
        } catch (Exception e) {
            return badRequest("Invalid date format.");
        }

        var user = context.query()
            .stream(
                of(User.class)
                .joining(User$.paymentMethods)
                .joining(User$.defaultPaymentMethod)
            )
            .filter(User$.id.equal(authenticatedUserId()))
            .findFirst()
            .orElse(null);

        if (user == null) return badRequest(USER_NOT_EXIST);

        var card = PaymentMethod
            .builder()
            .type(PaymentMethod.Type.CARD)
            .user(user)
            .cardNumber(request.getCardNumber())
            .nickname(request.getNickname())
            .cvv(request.getCvv())
            .country(request.getCountry())
            .expirationDate(expirationDate)
            .build();

        var success = card.vault(request.getNonce());
        if (!success) return badRequest("Make sure card data is valid.");
    
        user.getPaymentMethods().add(card);
        if(user.getDefaultPaymentMethod() == null || request.isSetDefault()) {
            user.setDefaultPaymentMethod(card);
            user.setDefaultPmt(PaymentMethod.Type.CARD);
        }

        context.db().persist(card);
        context.db().merge(user);
        return ok();
    }

    @Transactional
    @PostMapping("methods/{id}/default")
    @Secured({ Roles.RIDER })
    public Object saveDefault(@PathVariable("id") @NotBlank Long methodId) {
        var user = context.query()
            .stream(
                of(User.class)
                .joining(User$.paymentMethods)
                .joining(User$.defaultPaymentMethod)
            )
            .filter(User$.id.equal(authenticatedUserId()))
            .findFirst()
            .orElse(null);

        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        var newDefault = user.getPaymentMethods().stream()
            .filter(method -> method.getId().equals(methodId))
            .findFirst()
            .orElse(null);

        if(newDefault == null) {
            return badRequest("The payment method doesn't exist");
        }

        user.setDefaultPaymentMethod(newDefault);
        user.setDefaultPmt(newDefault.getType());
        context.db().merge(user);
        return ok();
    }

    @Transactional
    @GetMapping("methods/default")
    @Secured({ Roles.RIDER })
    public Object getDefault() {
        var user = context.query()
        .stream(
            of(User.class)
            .joining(User$.defaultPaymentMethod)
        )
        .filter(User$.id.equal(authenticatedUserId()))
        .findFirst()
        .orElse(null);

        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        var defaultMethod = user.getDefaultPaymentMethod();
        if(defaultMethod == null) return null;
        return mapper.map(defaultMethod, PaymentMethodDTO.class);
    }

    @Transactional
    @GetMapping("methods/test/authorize")
    @Secured({ Roles.RIDER })
    public Object authorize(@RequestParam double amount, @RequestParam String currency) {
        var user = context.query()
        .stream(
            of(User.class)
            .joining(User$.defaultPaymentMethod)
        )
        .filter(User$.id.equal(authenticatedUserId()))
        .findFirst()
        .orElse(null);

        if (user == null) {
            return badRequest(USER_NOT_EXIST);
        }

        Payment payment = user.getDefaultPaymentMethod().authorize(amount, currency, null);
        if(payment == null) {
            return badRequest("Something went wrong with the payment authorization");
        }

        // save payment to db

        return ok();
    }
    
    @Transactional
    @GetMapping("analytics")
    @Secured({ Roles.RIDER, Roles.DRIVER, Roles.ADMIN })
    public Object analytics(
        @RequestParam Long userId, 
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from, 
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        var dto = new AnalyticsDTO();
        var filter = Payment$.capturedAt.between(from, to);
        if (!Roles.ADMIN.equals(authenticatedUserRole())) {
            filter = Payment$.userId.equal(userId)
            .or(Payment$.driverId.equal(userId))
            .and(Payment$.capturedAt.between(from, to));
        }
        context.query()
            .stream(Payment.class)
            .filter(filter)
            .mapToDouble(Payment$.amount)
            .forEach(p -> {
                dto.setTotal(dto.getTotal() + p);
                dto.setPayments(dto.getPayments() + 1);
            });
        return ok(dto);
    }
}
