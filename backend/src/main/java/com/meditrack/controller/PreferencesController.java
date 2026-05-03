package com.meditrack.controller;

import com.meditrack.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
public class PreferencesController {

    private final UtilisateurRepository utilisateurRepository;

    @PatchMapping("/me/preferences")
    @Transactional
    public ResponseEntity<Void> updatePreferences(Authentication authentication, @RequestBody Map<String, Boolean> prefs) {
        // Dans notre config sécurité, le 'name' est l'email de l'utilisateur
        utilisateurRepository.findByEmail(authentication.getName()).ifPresent(u -> {
            if (prefs.containsKey("email")) u.setNotificationsEmail(prefs.get("email"));
            if (prefs.containsKey("sms")) u.setNotificationsSms(prefs.get("sms"));
            utilisateurRepository.save(u);
        });
        return ResponseEntity.ok().build();
    }
}
