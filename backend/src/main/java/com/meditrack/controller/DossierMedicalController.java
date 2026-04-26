package com.meditrack.controller;

import com.meditrack.dto.DossierMedicalRequestDTO;
import com.meditrack.model.DossierMedical;
import com.meditrack.service.DossierMedicalService;
import lombok.RequiredArgsConstructor;
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
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<DossierMedical> getDossierByPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(dossierMedicalService.getDossierByPatientId(patientId));
    }

    /**
     * Mettre à jour les informations médicales (allergies, poids, taille)
     */
    @PutMapping("/{id}")
    public ResponseEntity<DossierMedical> updateDossier(@PathVariable String id,
                                                        @RequestBody DossierMedicalRequestDTO dto) {
        return ResponseEntity.ok(dossierMedicalService.updateDossier(id, dto));
    }
}