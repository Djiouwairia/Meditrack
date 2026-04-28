package com.meditrack.config;

import com.meditrack.model.Hopital;
import com.meditrack.service.HopitalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class HopitalDataInitializer implements CommandLineRunner {

    private final HopitalService hopitalService;

    @Override
    public void run(String... args) {

        createIfNotExists("hopital1@meditrack.com",
                "Hôpital Principal de Dakar",
                "Dakar",
                "331234001");

        createIfNotExists("hopital2@meditrack.com",
                "Hôpital Aristide Le Dantec",
                "Dakar",
                "331234002");

        createIfNotExists("hopital3@meditrack.com",
                "Hôpital Régional de Ziguinchor",
                "Ziguinchor",
                "331234003");
    }

    private void createIfNotExists(String email, String nom, String adresse, String contact) {

        try {
            Hopital hopital = new Hopital();
            hopital.setNom(nom);
            hopital.setAdresse(adresse);
            hopital.setEmail(email);
            hopital.setContact(contact);

            hopitalService.createHopital(hopital);

            log.info("✅ Hôpital créé : {}", nom);

        } catch (Exception e) {
            log.info("ℹ️ Hôpital déjà existant : {}", nom);
        }
    }
}