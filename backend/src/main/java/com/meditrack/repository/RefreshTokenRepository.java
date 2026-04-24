package com.meditrack.repository;

import com.meditrack.model.RefreshToken;
import com.meditrack.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.utilisateur = :utilisateur AND r.revoked = false")
    void revokeAllByUtilisateur(@Param("utilisateur") Utilisateur utilisateur);
}