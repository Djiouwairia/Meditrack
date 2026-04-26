package com.meditrack.config;

import com.meditrack.enums.Role;
import com.meditrack.enums.StatutUtilisateur;
import com.meditrack.model.Medecin;
import com.meditrack.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MedecinDataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (utilisateurRepository.findByEmail("medecin@meditrack.com").isEmpty()) {
            Medecin medecin = new Medecin();
            medecin.setNom("Diallo");
            medecin.setPrenom("Mamadou");
            medecin.setEmail("medecin@meditrack.com");
            medecin.setTelephone("771234567");
            medecin.setMotDePasse(passwordEncoder.encode("Medecin@2024"));
            medecin.setRole(Role.MEDECIN);
            medecin.setStatutUtilisateur(StatutUtilisateur.ACTIF);
            medecin.setActif(true);
            medecin.setArchive(false);
            medecin.setSpecialite("Cardiologie");
            medecin.setDisponible(true);
            utilisateurRepository.save(medecin);
            log.info("✅ Médecin par défaut créé → email: medecin@meditrack.com | mdp: Medecin@2024");
        } else {
            log.info("ℹ️ Médecin déjà existant, initialisation ignorée.");
        }
    }
}