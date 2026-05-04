package com.meditrack.service;

import com.meditrack.dto.DisponibiliteRequestDTO;
import com.meditrack.exceptions.MedecinNotFoundException;
import com.meditrack.model.Disponibilite;
import com.meditrack.model.Medecin;
import com.meditrack.repository.DisponibiliteRepository;
import com.meditrack.repository.MedecinRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DisponibiliteService {

    private final DisponibiliteRepository disponibiliteRepository;
    private final MedecinRepository       medecinRepository;

    /**
     * Le médecin ajoute un créneau de disponibilité.
     * medecinId est extrait du JWT (passé depuis le controller).
     */
    @Transactional
    public Disponibilite ajouterDisponibilite(DisponibiliteRequestDTO dto) {
        Medecin medecin = medecinRepository.findById(dto.getMedecinId())
                .orElseThrow(() -> new MedecinNotFoundException("Médecin introuvable : " + dto.getMedecinId()));

        // Refuser les dates passées
        if (dto.getDate().isBefore(LocalDate.now()))
            throw new IllegalArgumentException("Impossible d'ajouter une disponibilité dans le passé.");

        // Refuser heureFin <= heureDebut
        if (!dto.getHeureFin().isAfter(dto.getHeureDebut()))
            throw new IllegalArgumentException("L'heure de fin doit être après l'heure de début.");

        // Vérifier chevauchement
        if (disponibiliteRepository.existsConflict(dto.getMedecinId(), dto.getDate(), dto.getHeureDebut(), dto.getHeureFin()))
            throw new IllegalArgumentException("Ce créneau chevauche une disponibilité existante.");

        int max = dto.getNombreMaxPatients() > 0 ? dto.getNombreMaxPatients() : 1;
        Disponibilite d = Disponibilite.builder()
                .id(generateId())
                .date(dto.getDate())
                .heureDebut(dto.getHeureDebut())
                .heureFin(dto.getHeureFin())
                .nombreMaxPatients(max)
                .placesRestantes(max)
                .estReserve(false)
                .medecin(medecin)
                .build();

        return disponibiliteRepository.save(d);
    }

    /** Toutes les disponibilités d'un médecin (passées + futures) */
    public List<Disponibilite> getDisponibilitesMedecin(String medecinId) {
        return disponibiliteRepository.findByMedecinIdFromDate(medecinId, LocalDate.now().minusDays(30));
    }

    /** Créneaux libres uniquement — utilisé par la secrétaire pour planifier */
    public List<Disponibilite> getCreneauxLibres(String medecinId) {
        return disponibiliteRepository.findLibresByMedecinId(medecinId, LocalDate.now());
    }

    /**
     * Appelé automatiquement lors de la création d'un RendezVous.
     */
    @Transactional
    public void reserverCreneau(String disponibiliteId) {
        Disponibilite d = disponibiliteRepository.findById(disponibiliteId)
                .orElseThrow(() -> new RuntimeException("Créneau introuvable : " + disponibiliteId));
        if (d.isEstReserve())
            throw new IllegalStateException("Ce créneau est déjà réservé.");
        d.setEstReserve(true);
        disponibiliteRepository.save(d);
    }

    /**
     * Libère un créneau (ex : annulation du RDV associé).
     */
    @Transactional
    public void libererCreneau(String disponibiliteId) {
        Disponibilite d = disponibiliteRepository.findById(disponibiliteId)
                .orElseThrow(() -> new RuntimeException("Créneau introuvable : " + disponibiliteId));
        d.setEstReserve(false);
        disponibiliteRepository.save(d);
    }

    /** Suppression d'un créneau (seulement si non réservé) */
    @Transactional
    public void supprimerDisponibilite(String id) {
        Disponibilite d = disponibiliteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Créneau introuvable : " + id));
        if (d.isEstReserve())
            throw new IllegalStateException("Impossible de supprimer un créneau déjà réservé.");
        disponibiliteRepository.deleteById(id);
    }

    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }
}