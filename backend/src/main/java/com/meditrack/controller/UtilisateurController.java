package com.meditrack.controller;

import com.meditrack.model.Utilisateur;
import com.meditrack.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/utilisateurs")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    @PostMapping
    public ResponseEntity<Utilisateur> createUtilisateur(@RequestBody Utilisateur utilisateur) {
        return new ResponseEntity<>(utilisateurService.createUtilisateur(utilisateur), HttpStatus.CREATED);
    }

    @PostMapping("/hopital/{idHopital}")
    public ResponseEntity<Utilisateur> createUtilisateurWithHopital(
            @RequestBody Utilisateur utilisateur,
            @PathVariable String idHopital) {   // ← était String id mais le path était {idHopital}
        return new ResponseEntity<>(utilisateurService.createUtilisateurWithHopital(utilisateur, idHopital), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<Utilisateur>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "nom") String sortBy) {
        return new ResponseEntity<>(utilisateurService.getAllUtilisateurs(page, size, sortBy), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Utilisateur>> findUtilisateurById(@PathVariable String id) {
        return new ResponseEntity<>(utilisateurService.getUtilisateurById(id), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUtilisateur(@PathVariable String id) {
        utilisateurService.deleteUtilisateur(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Utilisateur> updateUtilisateur(
            @PathVariable String id,
            @RequestBody Utilisateur utilisateur) {
        return new ResponseEntity<>(utilisateurService.updateUtilisateur(id, utilisateur), HttpStatus.OK);
    }

    // ─── Corrections : @PathVariable("id") doit correspondre au {id} du path ───

    @PatchMapping("/activer/{id}")
    public ResponseEntity<Utilisateur> activerUtilisateur(@PathVariable("id") String id) {
        return new ResponseEntity<>(utilisateurService.activerUtilisateur(id), HttpStatus.OK);
    }

    @PatchMapping("/desactiver/{id}")
    public ResponseEntity<Utilisateur> desactiverUtilisateur(@PathVariable("id") String id) {
        return new ResponseEntity<>(utilisateurService.desactiverUtilisateur(id), HttpStatus.OK);
    }

    @PatchMapping("/archiver/{id}")
    public ResponseEntity<Utilisateur> archiverUtilisateur(@PathVariable("id") String id) {
        return new ResponseEntity<>(utilisateurService.archiverUtilisateur(id), HttpStatus.OK);
    }

    @PatchMapping("/desarchiver/{id}")
    public ResponseEntity<Utilisateur> desarchiverUtilisateur(@PathVariable("id") String id) {
        return new ResponseEntity<>(utilisateurService.desarchiverUtilisateur(id), HttpStatus.OK);
    }
}