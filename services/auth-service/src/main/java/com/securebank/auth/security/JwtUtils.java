package com.securebank.auth.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    @Value("${jwt.refresh-expiration}")
    private long jwtRefreshExpirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Génère un access token JWT
     */
    public String generateAccessToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return generateToken(userPrincipal.getUsername(), jwtExpirationMs);
    }

    public String generateAccessToken(String email) {
        return generateToken(email, jwtExpirationMs);
    }

    public String generateRefreshToken(String email) {
        return generateToken(email, jwtRefreshExpirationMs);
    }

    private String generateToken(String subject, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey(), Jwts.SIG.HS256)   // <= Nouveau style 0.12.x
                .compact();
    }

    /**
     * Récupère l'email depuis un token JWT
     */
    public String getEmailFromJwt(String token) {
        JwtParser parser = Jwts.parser()
                .verifyWith(getSigningKey())   // <= remplace setSigningKey()
                .build();

        Jws<Claims> claims = parser.parseSignedClaims(token);

        return claims.getPayload().getSubject();
    }

    /**
     * Valide le token JWT
     */
    public boolean validateJwtToken(String token) {
        try {
            JwtParser parser = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build();

            Jws<Claims> claims = parser.parseSignedClaims(token);

            // Vérifie que le "subject" existe
            String subject = claims.getPayload().getSubject();
            if (subject == null || subject.isEmpty()) {
                logger.error("JWT subject is missing");
                return false;
            }

            return true;

        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        } catch (JwtException e) {
            logger.error("JWT validation error: {}", e.getMessage());
        }

        return false;
    }
}
