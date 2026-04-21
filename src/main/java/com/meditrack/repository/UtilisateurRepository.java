package com.meditrack.repository;

import com.meditrack.model.Utilisateur;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, String> {
    Page<Utilisateur> findAll(Pageable pageable);
    Optional<Utilisateur> findByEmail(String email);

    Optional<Utilisateur> findByTelephone(String contact);
}
