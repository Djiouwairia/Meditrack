package com.meditrack.repository;

import com.meditrack.model.Medecin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedecinRepository extends JpaRepository<Medecin, String> {

    /** Utilisé par /medecins/me pour retrouver le médecin connecté depuis son email JWT */
    Optional<Medecin> findByEmail(String email);

    Page<Medecin> findBySpecialite(String specialite, Pageable pageable);

    List<Medecin> findByDisponibleTrue();
}