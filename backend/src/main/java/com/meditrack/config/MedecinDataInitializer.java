package com.meditrack.config;

import com.meditrack.enums.Role;
import com.meditrack.enums.Sexe;
import com.meditrack.enums.StatutUtilisateur;
import com.meditrack.model.Hopital;
import com.meditrack.model.Medecin;
import com.meditrack.repository.HopitalRepository;
import com.meditrack.repository.MedecinRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class MedecinDataInitializer implements CommandLineRunner {

    private final MedecinRepository medecinRepository;
    private final HopitalRepository hopitalRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        Hopital hopitalDakar = getHopital("hopital1@meditrack.com", "Dakar");
        Hopital hopitalDantec = getHopital("hopital2@meditrack.com", "Dantec");
        Hopital hopitalZig = getHopital("hopital3@meditrack.com", "Ziguinchor");

        createIfNotExists(
                "medecin@meditrack.com",
                "Diallo", "Mamadou",
                "771234567",
                "Cardiologie",
                Sexe.HOMME,
                hopitalDakar
        );

        createIfNotExists(
                "medecin2@meditrack.com",
                "Ndiaye", "Awa",
                "772345678",
                "Pédiatrie",
                Sexe.FEMME,
                hopitalDantec
        );

        createIfNotExists(
                "medecin3@meditrack.com",
                "Sarr", "Ibrahima",
                "773456789",
                "Chirurgie",
                Sexe.HOMME,
                hopitalZig
        );

        log.info("🚀 Initialisation médecins terminée");
    }

    // ─────────────────────────────
    private void createIfNotExists(
            String email,
            String nom,
            String prenom,
            String tel,
            String specialite,
            Sexe sexe,
            Hopital hopital
    ) {

        if (medecinRepository.findByEmail(email).isPresent()) {
            return;
        }

        Medecin m = new Medecin();
        m.setId(generateId());
        m.setNom(nom);
        m.setPrenom(prenom);
        m.setEmail(email);
        m.setTelephone(tel);
        m.setMotDePasse(passwordEncoder.encode("Medecin@2024"));
        m.setRole(Role.MEDECIN);
        m.setStatutUtilisateur(StatutUtilisateur.ACTIF);
        m.setSexe(sexe);
        m.setSpecialite(specialite);
        m.setDisponible(true);
        m.setHopital(hopital);

        medecinRepository.save(m);

        log.info("✅ Médecin créé : {}", email);
    }

    // ─────────────────────────────
    private String generateId() {
        return UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8);
    }

    private Hopital getHopital(String email, String ville) {
        return hopitalRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Hôpital introuvable : " + ville));
    }
}