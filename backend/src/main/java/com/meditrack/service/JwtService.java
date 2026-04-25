package com.meditrack.service;

import com.meditrack.model.Utilisateur;
import com.meditrack.repository.UtilisateurRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final UtilisateurRepository utilisateurRepository;

    @Value("${jwt.accessToken.expiration}")
    private Long expiration;

    @Value("${jwt.secret-key}")
    private String secretKey;

    public String generateAccessToken(String email) {
        // Récupère le rôle depuis la base pour l'inclure dans le token
        String role = utilisateurRepository.findByEmail(email)
                .map(u -> u.getRole().name())          // ex: "ADMIN", "MEDECIN" …
                .orElse("UNKNOWN");

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)                   // ← claim ajouté
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean isTokenExpired(String token) {
        Date expiry = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
        return expiry.before(new Date());
    }

    /**
     * Le token est valide s'il N'EST PAS expiré ET que le sujet correspond.
     */
    public boolean isTokenValid(String token, String email) {
        return !isTokenExpired(token) && extractUsername(token).equals(email);
    }

    private Key getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}