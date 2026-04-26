package com.meditrack.repository;

import com.meditrack.model.Secretaire;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SecretaireRepository extends JpaRepository<Secretaire, String> {
    Optional<Secretaire> findByEmail(String email);
    Optional<Secretaire> findByTelephone(String telephone);
}