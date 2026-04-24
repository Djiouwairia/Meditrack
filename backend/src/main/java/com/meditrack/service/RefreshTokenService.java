package com.meditrack.service;

import com.meditrack.exceptions.TokenExpiredException;
import com.meditrack.exceptions.UtilisateurNotFoundException;
import com.meditrack.model.RefreshToken;
import com.meditrack.model.Utilisateur;
import com.meditrack.repository.RefreshTokenRepository;
import com.meditrack.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final JwtService jwtService;
    @Value("${jwt.refreshToken.expiration}")
    private Long refreshExpiration;
     public RefreshToken getRefreshToken(String email){
         Optional<Utilisateur> optionalUtilisateur = utilisateurRepository.findByEmail(email);
         if (optionalUtilisateur.isPresent()) {
             RefreshToken refreshToken = RefreshToken.builder()
                     .utilisateur(optionalUtilisateur.get())
                     .token(Base64.getEncoder().encodeToString(UUID.randomUUID().toString().getBytes()))
                     .expiryDate(Instant.now().plusMillis(refreshExpiration))
                     .revoked(false)
                     .build();
             return refreshTokenRepository.save(refreshToken);
         }
         else throw new UtilisateurNotFoundException("Utilisateur introuvable");
     }

     public boolean verifyExpiration(RefreshToken refreshToken){
         Optional<RefreshToken> optionalRefreshToken = refreshTokenRepository.findByToken(refreshToken.getToken());
         if (!optionalRefreshToken.isPresent()) {
            throw new TokenExpiredException("Veuillez vous reconnecter");
         }
         return Instant.now().isBefore(optionalRefreshToken.get().getExpiryDate());
     }

     public String generateNewToken(RefreshToken refreshToken){
         Optional<RefreshToken> optionalRefreshToken = refreshTokenRepository.findByToken(refreshToken.getToken());
         if (optionalRefreshToken.isPresent() && verifyExpiration(optionalRefreshToken.get())) {
             return jwtService.generateAccessToken(refreshToken.getUtilisateur().getEmail());
         }
         else throw new TokenExpiredException("Veuillez vous reconnecter");
     }

}
