package com.meditrack.model;

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

    /** false = libre, true = déjà réservé par un RDV */
    @Column(nullable = false)
    private boolean estReserve = false;

    /** Médecin propriétaire du créneau */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id", nullable = false)
    private Medecin medecin;
}