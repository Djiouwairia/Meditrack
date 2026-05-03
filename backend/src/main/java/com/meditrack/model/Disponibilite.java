package com.meditrack.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "disponibilite")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Disponibilite {

    @Id
    private String id;

    /** Date du créneau */
    @Column(nullable = false)
    private LocalDate date;

    /** Heure de début du créneau */
    @Column(nullable = false)
    private LocalTime heureDebut;

    /** Heure de fin du créneau */
    @Column(nullable = false)
    private LocalTime heureFin;

    /** false = libre, true = déjà réservé par un RDV (plus de places) */
    @Column(nullable = false)
    private boolean estReserve = false;

    @Column(nullable = false)
    private int nombreMaxPatients = 1;

    @Column(nullable = false)
    private int placesRestantes = 1;

    /** Médecin propriétaire du créneau */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medecin_id", nullable = false)
    @JsonIgnoreProperties({"rendezVous", "disponibilites", "motDePasse"})
    private Medecin medecin;
}