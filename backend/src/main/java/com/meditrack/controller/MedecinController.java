package com.meditrack.controller;

import com.meditrack.dto.MedecinRequestDTO;
import com.meditrack.model.Medecin;
import com.meditrack.service.MedecinService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/medecins")
public class MedecinController {

    private final MedecinService medecinService;

    @PostMapping
    public ResponseEntity<Medecin> createMedecin(@RequestBody MedecinRequestDTO dto) {
        return new ResponseEntity<>(medecinService.createMedecin(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<Medecin>> getAllMedecins(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "nom") String sortBy) {
        return ResponseEntity.ok(medecinService.getAllMedecins(page, size, sortBy));
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<Medecin>> getMedecinsDisponibles() {
        return ResponseEntity.ok(medecinService.getMedecinsDisponibles());
    }

    @GetMapping("/specialite/{specialite}")
    public ResponseEntity<Page<Medecin>> getMedecinsBySpecialite(
            @PathVariable String specialite,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(medecinService.getMedecinsBySpecialite(specialite, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medecin> getMedecinById(@PathVariable String id) {
        return ResponseEntity.ok(medecinService.getMedecinById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medecin> updateMedecin(@PathVariable String id,
                                                 @RequestBody MedecinRequestDTO dto) {
        return ResponseEntity.ok(medecinService.updateMedecin(id, dto));
    }

    @PatchMapping("/{id}/disponibilite")
    public ResponseEntity<Medecin> toggleDisponibilite(@PathVariable String id) {
        return ResponseEntity.ok(medecinService.toggleDisponibilite(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedecin(@PathVariable String id) {
        medecinService.deleteMedecin(id);
        return ResponseEntity.ok().build();
    }
}