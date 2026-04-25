package com.meditrack.config;

import com.meditrack.enums.Role;
import com.meditrack.model.Utilisateur;
import com.meditrack.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Crée un compte admin par défaut au démarrage si aucun n'existe.
 * Identifiants : admin@meditrack.com / Admin@2024
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminDataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (utilisateurRepository.findByEmail("admin@meditrack.com").isEmpty()) {
            Utilisateur admin = new Utilisateur();
            admin.setNom("Admin");
            admin.setPrenom("Super");
            admin.setEmail("admin@meditrack.com");
            admin.setMotDePasse(passwordEncoder.encode("Admin@2024"));
            admin.setTelephone("77 555 66 22");
            admin.setRole(Role.valueOf("ADMIN"));
            admin.setActif(true);
            admin.setArchive(false);
            utilisateurRepository.save(admin);
            log.info("✅ Admin par défaut créé → email: admin@meditrack.com | mdp: Admin@2024");
        } else {
            log.info("ℹ️ Admin déjà existant, initialisation ignorée.");
        }
    }
}