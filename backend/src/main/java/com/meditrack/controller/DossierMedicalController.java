package com.meditrack.controller;

import com.meditrack.dto.DossierMedicalRequestDTO;
import com.meditrack.model.DossierMedical;
import com.meditrack.service.DossierMedicalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequiredArgsConstructor
@RequestMapping("/dossiers-medicaux")
public class DossierMedicalController {

    private final DossierMedicalService dossierMedicalService;

    /**
     * Récupérer le dossier médical par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<DossierMedical> getDossierById(@PathVariable String id, 
                                                         @RequestParam(required = false) String code,
                                                         Authentication auth) {
        DossierMedical dossier = dossierMedicalService.getDossierById(id);
        return verifierAcces(dossier, code, auth);
    }

    /**
     * Récupérer le dossier médical d'un patient
     * Retourne 204 No Content si le dossier n'existe pas encore
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<DossierMedical> getDossierByPatient(@PathVariable String patientId,
                                                              @RequestParam(required = false) String code,
                                                              Authentication auth) {
        try {
            DossierMedical dossier = dossierMedicalService.getDossierByPatientId(patientId);
            return verifierAcces(dossier, code, auth);
        } catch (com.meditrack.exceptions.DossierMedicalNotFoundException e) {
            return ResponseEntity.noContent().build();
        }
    }

    private ResponseEntity<DossierMedical> verifierAcces(DossierMedical dossier, String code, Authentication auth) {
        boolean isMedecin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_MEDECIN"));
        boolean isPatient = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"));

        if (!isMedecin && !isPatient) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (isMedecin && (code == null || !code.equals(dossier.getCodeAccess()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(dossier);
    }

    /**
     * Créer un dossier médical pour un patient (accessible par MEDECIN, ADMIN, SECRETAIRE)
     */
    @PostMapping("/patient/{patientId}")
    public ResponseEntity<DossierMedical> creerDossier(@PathVariable String patientId) {
        DossierMedical dossier = dossierMedicalService.creerDossier(patientId);
        return new ResponseEntity<>(dossier, HttpStatus.CREATED);
    }

    /**
     * Mettre à jour les informations médicales (allergies, poids, taille)
     */
    @PutMapping("/{id}")
    public ResponseEntity<DossierMedical> updateDossier(@PathVariable String id,
                                                        @RequestBody DossierMedicalRequestDTO dto) {
        return ResponseEntity.ok(dossierMedicalService.updateDossier(id, dto));
    }

    /**
     * Mise à jour partielle du dossier médical (PATCH)
     */
    @PatchMapping("/{id}")
    public ResponseEntity<DossierMedical> patchDossier(@PathVariable String id,
                                                       @RequestBody DossierMedicalRequestDTO dto) {
        return ResponseEntity.ok(dossierMedicalService.updateDossier(id, dto));
    }
}