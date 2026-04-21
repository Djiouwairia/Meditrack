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
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class JwtService {
    private final UtilisateurRepository utilisateurRepository;

    private final String PREFIX = "Bearer ";
    @Value("${jwt.accessToken.expiration}")
    private Long expiration;

    @Value("${jwt.secret-key}")
    private String secretKey;

    public String generateAccessToken(String email) {
       Utilisateur optionalUtilisateur = utilisateurRepository.findByEmail(email).get();
       return Jwts.builder()
               .setSubject(email)
               .setExpiration(new Date(System.currentTimeMillis() + expiration))
               .setIssuedAt(new Date())
               .signWith(getSigningKey(), SignatureAlgorithm.HS256)
               .compact();

    }
    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token.replace("Bearer ", ""))
                .getBody()
                .getSubject();
    }
    public boolean isTokenExpired(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token.replace("Bearer ",""))
                .getBody()
                .getExpiration().before(new Date());
    }
    public boolean isTokenValid(String token,String email) {
        return  isTokenExpired(token) && extractUsername(token).equals(email);
    }
    private Key getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
