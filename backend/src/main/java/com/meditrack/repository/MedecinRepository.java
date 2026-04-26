package com.meditrack.repository;

import com.meditrack.model.Medecin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedecinRepository extends JpaRepository<Medecin, String> {
    Optional<Medecin> findByEmail(String email);
    Optional<Medecin> findByTelephone(String telephone);
    Page<Medecin> findBySpecialite(String specialite, Pageable pageable);
    List<Medecin> findByDisponibleTrue();
}