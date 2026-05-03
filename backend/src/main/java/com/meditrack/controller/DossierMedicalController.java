package com.meditrack.controller;

import com.meditrack.dto.DossierMedicalRequestDTO;
import com.meditrack.model.DossierMedical;
import com.meditrack.service.DossierMedicalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/dossiers-medicaux")
public class DossierMedicalController {

    private final DossierMedicalService dossierMedicalService;

    /**
     * Récupérer le dossier médical par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<DossierMedical> getDossierById(@PathVariable String id) {
        return ResponseEntity.ok(dossierMedicalService.getDossierById(id));
    }

    /**
     * Récupérer le dossier médical d'un patient
     * Retourne 204 No Content si le dossier n'existe pas encore
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<DossierMedical> getDossierByPatient(@PathVariable String patientId) {
        try {
            DossierMedical dossier = dossierMedicalService.getDossierByPatientId(patientId);
            return ResponseEntity.ok(dossier);
        } catch (com.meditrack.exceptions.DossierMedicalNotFoundException e) {
            return ResponseEntity.noContent().build();
        }
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