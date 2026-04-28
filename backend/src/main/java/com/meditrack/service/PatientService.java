package com.meditrack.service;

import com.meditrack.dto.PatientRequestDTO;
import com.meditrack.enums.Role;
import com.meditrack.enums.StatutUtilisateur;
import com.meditrack.exceptions.EmailAlreadyUsedException;
import com.meditrack.exceptions.PatientNotFoundException;
import com.meditrack.exceptions.TelephoneAlreadyUsedException;
import com.meditrack.model.Hopital;
import com.meditrack.model.Patient;
import com.meditrack.repository.HopitalRepository;
import com.meditrack.repository.PatientRepository;
import com.meditrack.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository      patientRepository;
    private final UtilisateurRepository  utilisateurRepository;
    private final HopitalRepository      hopitalRepository;
    private final BCryptPasswordEncoder  passwordEncoder;

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
        patient.setRole(Role.PATIENT);
        patient.setStatutUtilisateur(StatutUtilisateur.ACTIF);

        if (dto.getHopitalId() != null) {
            Hopital h = hopitalRepository.findById(dto.getHopitalId())
                    .orElseThrow(() -> new RuntimeException("Hôpital introuvable"));
            patient.setHopital(h);
        }

        return patientRepository.save(patient);
    }

    public Page<Patient> getAllPatients(int page, int size, String sortBy) {
        return patientRepository.findAll(PageRequest.of(page, size, Sort.by(sortBy)));
    }

    public Patient getPatientById(String id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient introuvable : " + id));
    }

    /**
     * Retourne le patient dont l'email correspond au JWT connecté.
     * Utilisé par GET /patients/me
     */
    public Patient getPatientByEmail(String email) {
        return patientRepository.findByEmail(email)
                .orElseThrow(() -> new PatientNotFoundException(
                        "Aucun patient trouvé pour l'email : " + email));
    }

    @Transactional
    public Patient updatePatient(String id, PatientRequestDTO dto) {
        Patient patient = getPatientById(id);

        if (!patient.getEmail().equals(dto.getEmail()) &&
                utilisateurRepository.findByEmail(dto.getEmail()).isPresent())
            throw new EmailAlreadyUsedException("Cet email est déjà utilisé !");

        if (dto.getTelephone() != null && !patient.getTelephone().equals(dto.getTelephone()) &&
                utilisateurRepository.findByTelephone(dto.getTelephone()).isPresent())
            throw new TelephoneAlreadyUsedException("Ce numéro est déjà utilisé !");

        patient.setNom(dto.getNom());
        patient.setPrenom(dto.getPrenom());
        patient.setEmail(dto.getEmail());
        if (dto.getTelephone() != null) patient.setTelephone(dto.getTelephone());
        if (dto.getAdresse()   != null) patient.setAdresse(dto.getAdresse());
        if (dto.getDateDeNaissance() != null) patient.setDateDeNaissance(dto.getDateDeNaissance());
        if (dto.getGroupeSanguin()   != null) patient.setGroupeSanguin(dto.getGroupeSanguin());

        return patientRepository.save(patient);
    }

    public void deletePatient(String id) {
        if (!patientRepository.existsById(id))
            throw new PatientNotFoundException("Patient introuvable : " + id);
        patientRepository.deleteById(id);
    }

    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }
}