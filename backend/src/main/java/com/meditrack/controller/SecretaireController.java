package com.meditrack.controller;

import com.meditrack.dto.PatientRequestDTO;
import com.meditrack.dto.RendezVousRequestDTO;
import com.meditrack.dto.SecretaireRequestDTO;
import com.meditrack.model.Patient;
import com.meditrack.model.RendezVous;
import com.meditrack.model.Secretaire;
import com.meditrack.service.PatientService;
import com.meditrack.service.RendezVousService;
import com.meditrack.service.SecretaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * La secrétaire peut :
 *  - Être créée / consultée / modifiée
 *  - Créer un patient
 *  - Gérer les rendez-vous (prise, confirmation, annulation)
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/secretaires")
public class SecretaireController {

    private final SecretaireService secretaireService;
    private final PatientService patientService;
    private final RendezVousService rendezVousService;

    // ──────────────────────────── CRUD Secrétaire ────────────────────────────

    @PostMapping
    public ResponseEntity<Secretaire> createSecretaire(@RequestBody SecretaireRequestDTO dto) {
        return new ResponseEntity<>(secretaireService.createSecretaire(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<Secretaire>> getAllSecretaires(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "nom") String sortBy) {
        return ResponseEntity.ok(secretaireService.getAllSecretaires(page, size, sortBy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Secretaire> getSecretaireById(@PathVariable String id) {
        return ResponseEntity.ok(secretaireService.getSecretaireById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Secretaire> updateSecretaire(@PathVariable String id,
                                                       @RequestBody SecretaireRequestDTO dto) {
        return ResponseEntity.ok(secretaireService.updateSecretaire(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSecretaire(@PathVariable String id) {
        secretaireService.deleteSecretaire(id);
        return ResponseEntity.ok().build();
    }

    // ──────────────────────── Actions métier Secrétaire ──────────────────────

    /**
     * La secrétaire crée un compte patient
     */
    @PostMapping("/{id}/creer-patient")
    public ResponseEntity<Patient> creerPatient(@PathVariable String id,
                                                @RequestBody PatientRequestDTO dto) {
        // On vérifie que la secrétaire existe
        secretaireService.getSecretaireById(id);
        return new ResponseEntity<>(patientService.createPatient(dto), HttpStatus.CREATED);
    }

    /**
     * La secrétaire prend un rendez-vous pour un patient
     */
    @PostMapping("/{id}/rendez-vous")
    public ResponseEntity<RendezVous> prendreRendezVous(@PathVariable String id,
                                                        @RequestBody RendezVousRequestDTO dto) {
        secretaireService.getSecretaireById(id);
        return new ResponseEntity<>(rendezVousService.prendreRendezVous(dto), HttpStatus.CREATED);
    }

    /**
     * La secrétaire confirme un rendez-vous
     */
    @PatchMapping("/{id}/rendez-vous/{rdvId}/confirmer")
    public ResponseEntity<RendezVous> confirmerRendezVous(@PathVariable String id,
                                                          @PathVariable String rdvId) {
        secretaireService.getSecretaireById(id);
        return ResponseEntity.ok(rendezVousService.confirmerRendezVous(rdvId));
    }

    /**
     * La secrétaire annule un rendez-vous
     */
    @PatchMapping("/{id}/rendez-vous/{rdvId}/annuler")
    public ResponseEntity<RendezVous> annulerRendezVous(@PathVariable String id,
                                                        @PathVariable String rdvId) {
        secretaireService.getSecretaireById(id);
        return ResponseEntity.ok(rendezVousService.annulerRendezVous(rdvId));
    }
}