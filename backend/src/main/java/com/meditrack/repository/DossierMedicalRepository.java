package com.meditrack.repository;

import com.meditrack.model.DossierMedical;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DossierMedicalRepository extends JpaRepository<DossierMedical, String> {
    Optional<DossierMedical> findByNumero(String numero);
    Optional<DossierMedical> findByPatientId(String patientId);
}