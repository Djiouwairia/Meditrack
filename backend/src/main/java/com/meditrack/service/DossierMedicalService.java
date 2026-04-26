package com.meditrack.service;

import com.meditrack.dto.DossierMedicalRequestDTO;
import com.meditrack.exceptions.DossierMedicalNotFoundException;
import com.meditrack.exceptions.PatientNotFoundException;
import com.meditrack.model.DossierMedical;
import com.meditrack.model.Patient;
import com.meditrack.repository.DossierMedicalRepository;
import com.meditrack.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DossierMedicalService {

    private final DossierMedicalRepository dossierMedicalRepository;
    private final PatientRepository patientRepository;

    public DossierMedical getDossierByPatientId(String patientId) {
        return dossierMedicalRepository.findByPatientId(patientId)
                .orElseThrow(() -> new DossierMedicalNotFoundException(
                        "Dossier médical introuvable pour le patient : " + patientId));
    }

    public DossierMedical getDossierById(String id) {
        return dossierMedicalRepository.findById(id)
                .orElseThrow(() -> new DossierMedicalNotFoundException("Dossier médical introuvable : " + id));
    }

    @Transactional
    public DossierMedical updateDossier(String id, DossierMedicalRequestDTO dto) {
        DossierMedical dossier = dossierMedicalRepository.findById(id)
                .orElseThrow(() -> new DossierMedicalNotFoundException("Dossier médical introuvable : " + id));

        dossier.setAllergies(dto.getAllergies());
        dossier.setPoids(dto.getPoids());
        dossier.setTaille(dto.getTaille());

        return dossierMedicalRepository.save(dossier);
    }

    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }
}