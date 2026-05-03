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
        DossierMedical dossier = dossierMedicalRepository.findByPatientId(patientId)
                .orElseThrow(() -> new DossierMedicalNotFoundException(
                        "Dossier médical introuvable pour le patient : " + patientId));
        
        if (dossier.getCodeAccess() == null || dossier.getCodeAccess().trim().isEmpty()) {
            dossier.setCodeAccess(generateCodeAccess());
            dossierMedicalRepository.save(dossier);
        }
        return dossier;
    }

    public DossierMedical getDossierById(String id) {
        DossierMedical dossier = dossierMedicalRepository.findById(id)
                .orElseThrow(() -> new DossierMedicalNotFoundException("Dossier médical introuvable : " + id));
        
        if (dossier.getCodeAccess() == null || dossier.getCodeAccess().trim().isEmpty()) {
            dossier.setCodeAccess(generateCodeAccess());
            dossierMedicalRepository.save(dossier);
        }
        return dossier;
    }

    @Transactional
    public DossierMedical creerDossier(String patientId) {
        // Si le dossier existe déjà, on le retourne
        var existing = dossierMedicalRepository.findByPatientId(patientId);
        if (existing.isPresent()) {
            return existing.get();
        }
        
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient introuvable : " + patientId));
        
        DossierMedical dossier = new DossierMedical();
        dossier.setId(generateId());
        dossier.setNumero("DM-" + System.currentTimeMillis());
        dossier.setCodeAccess(generateCodeAccess());
        dossier.setDateDeCreation(LocalDate.now());
        dossier.setPatient(patient);
        return dossierMedicalRepository.save(dossier);
    }

    @Transactional
    public DossierMedical updateDossier(String id, DossierMedicalRequestDTO dto) {
        DossierMedical dossier = dossierMedicalRepository.findById(id)
                .orElseThrow(() -> new DossierMedicalNotFoundException("Dossier médical introuvable : " + id));

        if (dto.getAllergies() != null) dossier.setAllergies(dto.getAllergies());
        if (dto.getPoids() != null) dossier.setPoids(dto.getPoids());
        if (dto.getTaille() != null) dossier.setTaille(dto.getTaille());
        if (dto.getTension() != null) dossier.setTension(dto.getTension());
        if (dto.getTemperature() != null) dossier.setTemperature(dto.getTemperature());
        if (dto.getAntecedents() != null) dossier.setAntecedents(dto.getAntecedents());
        if (dto.getTerrain() != null) dossier.setTerrain(dto.getTerrain());
        if (dto.getSuiviPrenatal() != null) dossier.setSuiviPrenatal(dto.getSuiviPrenatal());
        if (dto.getSuiviInfantile() != null) dossier.setSuiviInfantile(dto.getSuiviInfantile());
        if (dto.getPreventionPaludisme() != null) dossier.setPreventionPaludisme(dto.getPreventionPaludisme());
        if (dto.getAnalysesBiologiques() != null) dossier.setAnalysesBiologiques(dto.getAnalysesBiologiques());
        if (dto.getImagerie() != null) dossier.setImagerie(dto.getImagerie());
        if (dto.getRapportsSpecialistes() != null) dossier.setRapportsSpecialistes(dto.getRapportsSpecialistes());

        return dossierMedicalRepository.save(dossier);
    }

    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }

    private String generateCodeAccess() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        java.util.Random rnd = new java.util.Random();
        for (int i = 0; i < 5; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }
}