package com.meditrack.controller;

import com.meditrack.dto.RendezVousRequestDTO;
import com.meditrack.model.RendezVous;
import com.meditrack.service.RendezVousService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/rendez-vous")
public class RendezVousController {

    private final RendezVousService rendezVousService;

    /**
     * Prise de rendez-vous (patient ou secrétaire)
     */
    @PostMapping
    public ResponseEntity<RendezVous> prendreRendezVous(@RequestBody RendezVousRequestDTO dto) {
        return new ResponseEntity<>(rendezVousService.prendreRendezVous(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RendezVous> getRendezVousById(@PathVariable String id) {
        return ResponseEntity.ok(rendezVousService.getRendezVousById(id));
    }

    /**
     * Tous les rendez-vous d'un médecin (avec pagination)
     */
    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<Page<RendezVous>> getByMedecin(
            @PathVariable String medecinId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(rendezVousService.getRendezVousByMedecin(medecinId, page, size));
    }

    /**
     * Tous les rendez-vous d'un patient
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Page<RendezVous>> getByPatient(
            @PathVariable String patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(rendezVousService.getRendezVousByPatient(patientId, page, size));
    }

    /**
     * Agenda médecin : rendez-vous entre deux dates
     */
    @GetMapping("/medecin/{medecinId}/agenda")
    public ResponseEntity<List<RendezVous>> getAgendaMedecin(
            @PathVariable String medecinId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(rendezVousService.getAgendaMedecin(medecinId, debut, fin));
    }

    /**
     * Agenda du jour pour un médecin
     */
    @GetMapping("/medecin/{medecinId}/aujourd-hui")
    public ResponseEntity<List<RendezVous>> getAgendaAujourdhui(@PathVariable String medecinId) {
        return ResponseEntity.ok(rendezVousService.getAgendaAujourdhui(medecinId));
    }

    /**
     * Confirmer un rendez-vous
     */
    @PatchMapping("/{id}/confirmer")
    public ResponseEntity<RendezVous> confirmer(@PathVariable String id) {
        return ResponseEntity.ok(rendezVousService.confirmerRendezVous(id));
    }

    /**
     * Annuler un rendez-vous
     */
    @PatchMapping("/{id}/annuler")
    public ResponseEntity<RendezVous> annuler(@PathVariable String id) {
        return ResponseEntity.ok(rendezVousService.annulerRendezVous(id));
    }

    /**
     * Terminer un rendez-vous (le médecin pose un diagnostic)
     */
    @PatchMapping("/{id}/terminer")
    public ResponseEntity<RendezVous> terminer(@PathVariable String id,
                                               @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(rendezVousService.terminerRendezVous(id, body.get("diagnostic")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRendezVous(@PathVariable String id) {
        rendezVousService.deleteRendezVous(id);
        return ResponseEntity.ok().build();
    }
}