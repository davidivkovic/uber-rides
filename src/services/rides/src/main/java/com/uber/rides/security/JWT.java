package com.uber.rides.security;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.servlet.HandlerInterceptor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;

import com.uber.rides.model.User;

@Component
public class JWT {
    
    static final String ISSUER = "uber-rides";
    static final String AUDIENCE = "uber-spa";
    static final String KEY = "448ba5288b28cc80";
    public static final String ROLE_CLAIM = "rol";
    
    static final int DURATION_IN_MILLISECONDS = 60 * 24 * 60 * 60 * 1000;

    static final JwtParser parser = Jwts.parser()
        .requireIssuer(ISSUER)
        .requireAudience(AUDIENCE)
        .setSigningKey(KEY);

    public static String getJWT(User user) {
        return Jwts.builder()
            .setClaims(new HashMap<>(Map.of(ROLE_CLAIM, user.getRole())))
            .setIssuer(ISSUER)
            .setAudience(AUDIENCE)
            .setSubject(String.valueOf(user.getId()))
            .setIssuedAt(new Date())
            .setExpiration(new Date(new Date().getTime() + DURATION_IN_MILLISECONDS))
            .signWith(SignatureAlgorithm.HS512, KEY)
            .compact();
    }

    public static Claims parseJWT(String token) {
        try {
            return parser.parseClaimsJws(token).getBody();
        }
        catch (Exception e) {
            return Jwts.claims();
        }
    }

    @Component
    public class Interceptor implements HandlerInterceptor {

        Logger log = LoggerFactory.getLogger(JWT.Interceptor.class);

        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
            
            var secured = secured(handler);
            if (secured == null || authorize(request) || allowAnonymous(secured)) return true;
            
            return abortWithUnauthorized(response);

        }

        Secured secured(Object handler) {

            if (handler instanceof HandlerMethod method) {
                return method.getMethod().getAnnotation(Secured.class);
            }
            return null;

        }

        boolean allowAnonymous(Secured secured) {
            return List.of(secured.value()).contains(User.Roles.ANONYMOUS);
        }

        boolean abortWithUnauthorized(HttpServletResponse response) {

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;

        }

        boolean authorize(HttpServletRequest request) {
            
            var header = request.getHeader("Authorization");
            if (header == null || !header.startsWith("Bearer ")) {
                return false;
            }

            var token = header.substring(7);
            if (token == null) return false;

            var jwt = parseJWT(token);
            if (jwt.getSubject() == null) return false;
            
            SecurityContextHolder
                .getContext()
                .setAuthentication(
                    new UsernamePasswordAuthenticationToken(
                        jwt.getSubject(),
                        jwt.getId(),
                        List.of(new SimpleGrantedAuthority(jwt.get(ROLE_CLAIM, String.class)))
                    )
                );

            return true;

        }

    }

}