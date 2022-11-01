package com.uber.rides.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public InMemoryUserDetailsManager userDetailsManager() {
        User.UserBuilder user = User.withDefaultPasswordEncoder()
                .username("user1@gmail.com")
                .password("password1")
                .roles("RIDER");
        return new InMemoryUserDetailsManager(user.build());
    }

    @Bean
    public SecurityFilterChain configure(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth.requestMatchers("/test", "/", "/swagger-ui/**", "/v3/api-docs/**").permitAll())
                .httpBasic(Customizer.withDefaults())
                .build();
    }
}
