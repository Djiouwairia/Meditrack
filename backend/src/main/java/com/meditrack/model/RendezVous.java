package com.meditrack.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.meditrack.enums.StatutRendezVous;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class RendezVous {

    @Id
    @EqualsAndHashCode.Include
    private String id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime heure;

    private String motif;
    private String diagnostic;

    @Enumerated(EnumType.STRING)
    private StatutRendezVous statut = StatutRendezVous.EN_ATTENTE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonBackReference("patient-rdv")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id", nullable = false)
    @JsonBackReference("medecin-rdv")
    private Medecin medecin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_medical_id")
    @JsonBackReference("dossier-rdv")
    private DossierMedical dossierMedical;

    @OneToMany(mappedBy = "rendezVous", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Ordonnance> ordonnances;
}