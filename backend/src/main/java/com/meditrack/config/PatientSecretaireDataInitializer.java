package com.meditrack.config;

import com.meditrack.enums.Role;
import com.meditrack.enums.StatutUtilisateur;
import com.meditrack.model.Patient;
import com.meditrack.model.Secretaire;
import com.meditrack.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class PatientSecretaireDataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        // ── Patient ──────────────────────────────────────────────────────────
        if (utilisateurRepository.findByEmail("patient@meditrack.com").isEmpty()) {
            Patient patient = new Patient();
            patient.setNom("Sow");
            patient.setPrenom("Fatou");
            patient.setEmail("patient@meditrack.com");
            patient.setTelephone("770000001");
            patient.setMotDePasse(passwordEncoder.encode("Patient@2024"));
            patient.setRole(Role.PATIENT);
            patient.setStatutUtilisateur(StatutUtilisateur.ACTIF);
            patient.setActif(true);
            patient.setArchive(false);
            patient.setAdresse("Ziguinchor, Sénégal");
            patient.setDateDeNaissance(LocalDate.of(1995, 6, 15));
            patient.setGroupeSanguin("O+");
            utilisateurRepository.save(patient);
            log.info("✅ Patient par défaut créé → email: patient@meditrack.com | mdp: Patient@2024");
        } else {
            log.info("ℹ️ Patient déjà existant, initialisation ignorée.");
        }

        // ── Secrétaire ───────────────────────────────────────────────────────
        if (utilisateurRepository.findByEmail("secretaire@meditrack.com").isEmpty()) {
            Secretaire secretaire = new Secretaire();
            secretaire.setNom("Badji");
            secretaire.setPrenom("Aminata");
            secretaire.setEmail("secretaire@meditrack.com");
            secretaire.setTelephone("770000002");
            secretaire.setMotDePasse(passwordEncoder.encode("Secretaire@2024"));
            secretaire.setRole(Role.SECRETAIRE);
            secretaire.setStatutUtilisateur(StatutUtilisateur.ACTIF);
            secretaire.setActif(true);
            secretaire.setArchive(false);
            utilisateurRepository.save(secretaire);
            log.info("✅ Secrétaire par défaut créée → email: secretaire@meditrack.com | mdp: Secretaire@2024");
        } else {
            log.info("ℹ️ Secrétaire déjà existante, initialisation ignorée.");
        }
    }
}