package com.busbooking.BustTicketBooking.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwtSecret}")
    private String jwtSecretBase64;

    @Value("${app.jwtExpirationInMs:604800000}")
    private int jwtExpirationInMs;

    private Key getSigningKey() {
        try {
            if (jwtSecretBase64.contains("-") || jwtSecretBase64.contains("_")) {
                logger.debug("Key appears to be URL-safe encoded. Using Base64URL decoder.");
                return Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(jwtSecretBase64));
            } else {
                logger.debug("Using standard Base64 decoder.");
                return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecretBase64));
            }
        } catch (IllegalArgumentException ex) {
            logger.error("Error decoding JWT secret: {}", ex.getMessage());
            throw ex;
        }
    }

    public String generateToken(Authentication authentication) {
        CustomUserDetails userPrincipal = (CustomUserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        Key key = getSigningKey();

        return Jwts.builder()
                .setSubject(Long.toString(userPrincipal.getId()))
                .claim("role", userPrincipal.getUser().getRole().name())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }


    public Long getUserIdFromJWT(String token) {
        Key key = getSigningKey();

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return Long.parseLong(claims.getSubject());
    }

    public boolean validateToken(String authToken) {
        try {
            Key key = getSigningKey();
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
            return true;
        } catch (JwtException ex) {
            logger.error("Invalid JWT token: {}", ex.getMessage());
        }
        return false;
    }
}
