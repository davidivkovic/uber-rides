package com.uber.rides.dto.user;

import java.time.LocalDate;
import java.util.regex.Pattern;

import lombok.Getter;
import lombok.Setter;

import static com.uber.rides.util.Utils.mapper;

import com.uber.rides.model.PaymentMethod;
import com.uber.rides.model.PaymentMethod.Type;

@Getter
@Setter
public class PaymentMethodDTO {

    public enum CardType {

        UNKNOWN,
        VISA("^4[0-9]{12}(?:[0-9]{3}){0,2}$"),
        MASTERCARD("^(?:5[1-5]|2(?!2([01]|20)|7(2[1-9]|3))[2-7])\\d{14}$"),
        AMERICAN_EXPRESS("^3[47][0-9]{13}$"),
        DINERS_CLUB("^3(?:0[0-5]\\d|095|6\\d{0,2}|[89]\\d{2})\\d{12,15}$"),
        DISCOVER("^6(?:011|[45][0-9]{2})[0-9]{12}$"),
        JCB("^(?:2131|1800|35\\d{3})\\d{11}$"),
        CHINA_UNION_PAY("^62[0-9]{14,17}$");
    
        private Pattern pattern;
    
        CardType() {
            this.pattern = null;
        }
    
        CardType(String pattern) {
            this.pattern = Pattern.compile(pattern);
        }
    
        public static CardType detect(String cardNumber) {
    
            for (CardType cardType : CardType.values()) {
                if (null == cardType.pattern) continue;
                if (cardType.pattern.matcher(cardNumber).matches()) return cardType;
            }
    
            return UNKNOWN;
        }

        @Override
        public String toString() {
            return name().substring(0, 1).toUpperCase() + name().substring(1).toLowerCase();
        }
    
    }

    static {
        mapper
        .typeMap(PaymentMethod.class, PaymentMethodDTO.class)
        .addMappings(mapper -> mapper
            .map(PaymentMethod::getTypeName, PaymentMethodDTO::setName)
        )
        .addMappings(mapper -> mapper
            .map(PaymentMethod::getCardNumber, PaymentMethodDTO::setTypeDetails)
        );
    }

    Long id;
    String token;
    Type type;

    /* Paypal info */
    String email;

    /* Card Info */
    String cardNumber;
    String cvv;
    LocalDate expirationDate;
    String nickname; 
    String country;

    boolean isDefault;

    String name;

    String typeDetails;

    void setTypeDetails(String cardNumber) {
        if(cardNumber == null) {
            this.typeDetails = "Paypal"; 
            return;
        }
        var formattedNumber = String.join("", cardNumber.split(" "));
        this.typeDetails = CardType.detect(formattedNumber).toString();
    }
}
