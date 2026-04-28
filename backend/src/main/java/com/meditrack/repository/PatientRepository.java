package com.meditrack.repository;

import com.meditrack.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, String> {

    /** Utilisé par /patients/me pour retrouver le patient connecté depuis son email JWT */
    Optional<Patient> findByEmail(String email);
}