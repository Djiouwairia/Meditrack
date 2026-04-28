package com.meditrack.config;

import com.meditrack.enums.Role;
import com.meditrack.enums.Sexe;
import com.meditrack.enums.StatutUtilisateur;
import com.meditrack.model.Hopital;
import com.meditrack.model.Patient;
import com.meditrack.model.Secretaire;
import com.meditrack.repository.HopitalRepository;
import com.meditrack.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(3)
public class PatientSecretaireDataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final HopitalRepository hopitalRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        Hopital hopitalDakar = hopitalRepository.findByEmail("hopital1@meditrack.com")
                .orElseThrow(() -> new RuntimeException("Hopital Dakar introuvable"));

        Hopital hopitalDantec = hopitalRepository.findByEmail("hopital2@meditrack.com")
                .orElseThrow(() -> new RuntimeException("Hopital Dantec introuvable"));

        Hopital hopitalZig = hopitalRepository.findByEmail("hopital3@meditrack.com")
                .orElseThrow(() -> new RuntimeException("Hopital Ziguinchor introuvable"));

        // ───────────── PATIENT ─────────────
        if (utilisateurRepository.findByEmail("patient@meditrack.com").isEmpty()) {

            Patient patient = new Patient();
            patient.setId(generateId());

            patient.setNom("Sow");
            patient.setPrenom("Fatou");
            patient.setEmail("patient@meditrack.com");
            patient.setTelephone("770000001");
            patient.setMotDePasse(passwordEncoder.encode("Patient@2024"));

            patient.setRole(Role.PATIENT);
            patient.setStatutUtilisateur(StatutUtilisateur.ACTIF);
            patient.setAdresse("Ziguinchor, Sénégal");
            patient.setDateDeNaissance(LocalDate.of(1995, 6, 15));
            patient.setGroupeSanguin("O+");

            patient.setSexe(Sexe.FEMME);
            patient.setHopital(hopitalZig);

            utilisateurRepository.save(patient);

            log.info("✅ Patient créé avec hôpital Ziguinchor");
        }

        // ───────────── SECRETAIRE (inchangé) ─────────────
        if (utilisateurRepository.findByEmail("secretaire@meditrack.com").isEmpty()) {

            Secretaire secretaire = new Secretaire();
            secretaire.setId(generateId());

            secretaire.setNom("Badji");
            secretaire.setPrenom("Aminata");
            secretaire.setEmail("secretaire@meditrack.com");
            secretaire.setTelephone("770000002");
            secretaire.setMotDePasse(passwordEncoder.encode("Secretaire@2024"));

            secretaire.setRole(Role.SECRETAIRE);
            secretaire.setStatutUtilisateur(StatutUtilisateur.ACTIF);
            secretaire.setSexe(Sexe.FEMME);
            secretaire.setHopital(hopitalDakar);

            utilisateurRepository.save(secretaire);

            log.info("✅ Secrétaire créée avec hôpital Dakar");
        }
    }

    // ───────────── ID GENERATOR ─────────────
    private String generateId() {
        return UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8);
    }
}