package com.meditrack.repository;

import com.meditrack.model.Secretaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SecretaireRepository extends JpaRepository<Secretaire, String> {
    Optional<Secretaire> findByEmail(String email);
}