package com.meditrack.controller;

import com.meditrack.dto.DisponibiliteRequestDTO;
import com.meditrack.model.Disponibilite;
import com.meditrack.service.DisponibiliteService;
import com.meditrack.service.MedecinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/disponibilites")
public class DisponibiliteController {

    private final DisponibiliteService disponibiliteService;
    private final MedecinService       medecinService;

    /**
     * Le médecin connecté ajoute un créneau.
     * On extrait son id depuis le JWT → pas besoin qu'il le passe dans le body.
     */
    @PostMapping
    public ResponseEntity<Disponibilite> ajouter(@RequestBody DisponibiliteRequestDTO dto,
                                                 Authentication auth) {
        // Forcer le medecinId depuis le JWT (sécurité)
        String email = auth.getName();
        dto.setMedecinId(medecinService.getMedecinByEmail(email).getId());
        return new ResponseEntity<>(disponibiliteService.ajouterDisponibilite(dto), HttpStatus.CREATED);
    }

    /**
     * Toutes les disponibilités d'un médecin (passées filtrées côté service).
     * Accessible au médecin lui-même, à la secrétaire et à l'admin.
     */
    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<Disponibilite>> getByMedecin(@PathVariable String medecinId) {
        return ResponseEntity.ok(disponibiliteService.getDisponibilitesMedecin(medecinId));
    }

    /**
     * Créneaux LIBRES d'un médecin — utilisé par la secrétaire pour planifier.
     */
    @GetMapping("/medecin/{medecinId}/libres")
    public ResponseEntity<List<Disponibilite>> getLibres(@PathVariable String medecinId) {
        return ResponseEntity.ok(disponibiliteService.getCreneauxLibres(medecinId));
    }

    /**
     * Le médecin supprime un de ses créneaux (seulement s'il n'est pas réservé).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable String id) {
        disponibiliteService.supprimerDisponibilite(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Libérer manuellement un créneau (ex : annulation RDV côté admin).
     */
    @PatchMapping("/{id}/liberer")
    public ResponseEntity<Void> liberer(@PathVariable String id) {
        disponibiliteService.libererCreneau(id);
        return ResponseEntity.ok().build();
    }
}