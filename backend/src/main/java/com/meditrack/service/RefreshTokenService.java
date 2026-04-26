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
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final JwtService jwtService;

    @Value("${jwt.refreshToken.expiration}")
    private Long refreshExpiration;

    /**
     * Crée (ou renouvelle) le refresh token d'un utilisateur.
     */
    @Transactional
    public RefreshToken getRefreshToken(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UtilisateurNotFoundException("Utilisateur introuvable"));

        // Révoquer les anciens tokens de cet utilisateur
        refreshTokenRepository.revokeAllByUtilisateur(utilisateur);

        RefreshToken refreshToken = RefreshToken.builder()
                .utilisateur(utilisateur)
                .token(Base64.getEncoder().encodeToString(UUID.randomUUID().toString().getBytes()))
                .expiryDate(Instant.now().plusMillis(refreshExpiration))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken findByToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenExpiredException("Refresh token introuvable. Veuillez vous reconnecter."));
    }

    public boolean verifyExpiration(RefreshToken refreshToken) {
        if (refreshToken.isRevoked() || Instant.now().isAfter(refreshToken.getExpiryDate())) {
            refreshTokenRepository.delete(refreshToken);
            throw new TokenExpiredException("Session expirée. Veuillez vous reconnecter.");
        }
        return true;
    }

    public String generateNewToken(RefreshToken refreshToken) {
        verifyExpiration(refreshToken);
        return jwtService.generateAccessToken(refreshToken.getUtilisateur().getEmail());
    }
}