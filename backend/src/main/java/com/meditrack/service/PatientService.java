package com.meditrack.service;

import com.meditrack.dto.PatientRequestDTO;
import com.meditrack.enums.Role;
import com.meditrack.enums.StatutUtilisateur;
import com.meditrack.exceptions.EmailAlreadyUsedException;
import com.meditrack.exceptions.PatientNotFoundException;
import com.meditrack.exceptions.TelephoneAlreadyUsedException;
import com.meditrack.model.DossierMedical;
import com.meditrack.model.Hopital;
import com.meditrack.model.Patient;
import com.meditrack.repository.DossierMedicalRepository;
import com.meditrack.repository.HopitalRepository;
import com.meditrack.repository.PatientRepository;
import com.meditrack.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final HopitalRepository hopitalRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public Patient createPatient(PatientRequestDTO dto) {
        if (utilisateurRepository.findByEmail(dto.getEmail()).isPresent())
            throw new EmailAlreadyUsedException("Cet email est déjà utilisé !");
        if (utilisateurRepository.findByTelephone(dto.getTelephone()).isPresent())
            throw new TelephoneAlreadyUsedException("Ce numéro de téléphone est déjà utilisé !");

        Patient patient = new Patient();
        patient.setId(generateId());
        patient.setNom(dto.getNom());
        patient.setPrenom(dto.getPrenom());
        patient.setEmail(dto.getEmail());
        patient.setTelephone(dto.getTelephone());
        patient.setMotDePasse(passwordEncoder.encode(dto.getMotDePasse()));
        patient.setAdresse(dto.getAdresse());
        patient.setDateDeNaissance(dto.getDateDeNaissance());
        patient.setGroupeSanguin(dto.getGroupeSanguin());
        patient.setRole(Role.PATIENT);
        patient.setStatutUtilisateur(StatutUtilisateur.ACTIF);

        if (dto.getHopitalId() != null) {
            Hopital hopital = hopitalRepository.findById(dto.getHopitalId())
                    .orElseThrow(() -> new RuntimeException("Hôpital introuvable"));
            patient.setHopital(hopital);
        }

        Patient savedPatient = patientRepository.save(patient);

        // Créer automatiquement un dossier médical pour le nouveau patient
        DossierMedical dossierMedical = new DossierMedical();
        dossierMedical.setId(generateId());
        dossierMedical.setNumero("DOS-" + savedPatient.getId().toUpperCase());
        dossierMedical.setDateDeCreation(LocalDate.now());
        dossierMedical.setPatient(savedPatient);
        dossierMedicalRepository.save(dossierMedical);

        return savedPatient;
    }

    public Page<Patient> getAllPatients(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return patientRepository.findAll(pageable);
    }

    public Patient getPatientById(String id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient introuvable avec l'id : " + id));
    }

    @Transactional
    public Patient updatePatient(String id, PatientRequestDTO dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient introuvable avec l'id : " + id));

        // Vérification unicité email si modifié
        if (!patient.getEmail().equals(dto.getEmail()) &&
                utilisateurRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyUsedException("Cet email est déjà utilisé !");
        }
        if (!patient.getTelephone().equals(dto.getTelephone()) &&
                utilisateurRepository.findByTelephone(dto.getTelephone()).isPresent()) {
            throw new TelephoneAlreadyUsedException("Ce numéro est déjà utilisé !");
        }

        patient.setNom(dto.getNom());
        patient.setPrenom(dto.getPrenom());
        patient.setEmail(dto.getEmail());
        patient.setTelephone(dto.getTelephone());
        patient.setAdresse(dto.getAdresse());
        patient.setDateDeNaissance(dto.getDateDeNaissance());
        patient.setGroupeSanguin(dto.getGroupeSanguin());

        return patientRepository.save(patient);
    }

    public void deletePatient(String id) {
        if (!patientRepository.existsById(id))
            throw new PatientNotFoundException("Patient introuvable avec l'id : " + id);
        patientRepository.deleteById(id);
    }

    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }
}