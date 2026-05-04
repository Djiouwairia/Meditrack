package com.meditrack.repository;

import com.meditrack.model.Ordonnance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrdonnanceRepository extends JpaRepository<Ordonnance, String> {
    Page<Ordonnance> findByDossierMedicalId(String dossierMedicalId, Pageable pageable);
    Page<Ordonnance> findByRendezVousId(String rendezVousId, Pageable pageable);
    Page<Ordonnance> findByRendezVousMedecinId(String medecinId, Pageable pageable);
}