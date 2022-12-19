package com.uber.rides.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Random;

import javax.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
@Setter
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User implements UserDetails {

    public class Roles {

        private Roles() {}
    
        public static final String ANONYMOUS = "ROLE_ANONYMOUS";
        public static final String ADMIN = "ROLE_ADMIN";
        public static final String DRIVER = "ROLE_DRIVER";
        public static final String RIDER = "ROLE_RIDER";
    
    }

    @Embeddable
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OTP {

        static final Random random = new Random();

        public String value;
        public LocalDateTime expires;

        public boolean isValid(String code, LocalDateTime now) {
            return value.equals(code) && this.expires.isAfter(now);
        }

        public static OTP generate(LocalDateTime now) {
            return new OTP(
                String.format("%06d", random.nextInt(999_999)),
                now.plusMinutes(30)
            );
        }
        
    }

    public static final String DEFAULT_PFP = "default_pfp.png"; 

    @Id @GeneratedValue Long id;
    String role;
    String firstName;
    String lastName;
    String email;
    String password;
    String city;
    String phoneNumber;
    String profilePicture;
    String blockReason;
    boolean emailConfirmed;
    boolean blocked;
    boolean completedRegistration;
    double rating;
    OTP confirmationCode;
    String customerId;

    @Embedded Payment.Method defaultPaymentMethod;
    
    @OneToOne(fetch = FetchType.LAZY) UserUpdateRequest updateRequest;
    @OneToOne Car car;
    
    @OneToMany @Builder.Default List<Card> cards = new ArrayList<>();
    @OneToOne(fetch = FetchType.LAZY) Paypal paypal;
    
    @ManyToMany @Builder.Default List<Route> favoriteRoutes = new ArrayList<>();
    
    @OneToMany(mappedBy = "driver") List<Trip> tripsAsDriver;
    @ManyToMany(mappedBy = "riders") List<Trip> tripsAsRider;

    @Transient Trip currentTrip;

    public void addFavoriteRoute(Route route) {
        favoriteRoutes.add(route);
    }

    public void removeFavoriteRoute(Long routeId) {
        favoriteRoutes.removeIf(route -> route.id.equals(routeId));
    }

    public void addCard(Card card) {
        cards.add(card);
    }

    public void removeCard(Long cardId) {
        cards.removeIf(card -> card.id.equals(cardId));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}