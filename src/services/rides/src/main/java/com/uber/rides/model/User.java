package com.uber.rides.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Random;

import javax.persistence.*;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    public static class OTP implements Serializable {

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

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    long id;
    String role;
    String firstName;
    String lastName;
    String email;
    String password;
    String city;
    String phoneNumber;
    String profilePicture;
    boolean emailConfirmed;
    @Embedded OTP confirmationCode;

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