package com.meditrack.controller;

import com.meditrack.dto.OrdonnanceRequestDTO;
import com.meditrack.model.Ordonnance;
import com.meditrack.service.OrdonnanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ordonnances")
public class OrdonnanceController {

    private final OrdonnanceService ordonnanceService;

    /**
     * Le médecin crée une ordonnance à la fin d'un rendez-vous
     */
    @PostMapping
    public ResponseEntity<Ordonnance> creerOrdonnance(@RequestBody OrdonnanceRequestDTO dto) {
        return new ResponseEntity<>(ordonnanceService.creerOrdonnance(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ordonnance> getOrdonnanceById(@PathVariable String id) {
        return ResponseEntity.ok(ordonnanceService.getOrdonnanceById(id));
    }

    /**
     * Toutes les ordonnances d'un dossier médical
     */
    @GetMapping("/dossier/{dossierMedicalId}")
    public ResponseEntity<Page<Ordonnance>> getByDossier(
            @PathVariable String dossierMedicalId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ordonnanceService.getOrdonnancesByDossier(dossierMedicalId, page, size));
    }

    /**
     * Ordonnances liées à un rendez-vous précis
     */
    @GetMapping("/rendez-vous/{rendezVousId}")
    public ResponseEntity<Page<Ordonnance>> getByRendezVous(
            @PathVariable String rendezVousId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ordonnanceService.getOrdonnancesByRendezVous(rendezVousId, page, size));
    }

    /**
     * Toutes les ordonnances d'un médecin
     */
    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<Page<Ordonnance>> getByMedecin(
            @PathVariable String medecinId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ordonnanceService.getOrdonnancesByMedecin(medecinId, page, size));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrdonnance(@PathVariable String id) {
        ordonnanceService.deleteOrdonnance(id);
        return ResponseEntity.ok().build();
    }
}