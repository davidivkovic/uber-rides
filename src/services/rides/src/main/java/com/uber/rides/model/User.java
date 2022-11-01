package com.uber.rides.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
public class User implements UserDetails {

    public enum Type {
        ADMIN,
        DRIVER,
        RIDER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;
    @Enumerated(EnumType.STRING)
    private Type type;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String city;
    private String phoneNumber;
    private String profilePicture;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(type.toString()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}