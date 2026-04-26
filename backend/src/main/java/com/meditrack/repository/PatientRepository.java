// ===== PatientRepository.java =====
package com.meditrack.repository;

import com.meditrack.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, String> {
    Optional<Patient> findByEmail(String email);
    Optional<Patient> findByTelephone(String telephone);
}