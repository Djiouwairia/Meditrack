package com.meditrack.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnoreProperties({"rendezVous", "dossierMedical", "motDePasse"})
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medecin_id", nullable = false)
    @JsonIgnoreProperties({"rendezVous", "motDePasse", "disponibilites"})
    private Medecin medecin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_medical_id")
    @JsonIgnoreProperties({"rendezVous", "patient", "ordonnances"})
    private DossierMedical dossierMedical;

    @OneToMany(mappedBy = "rendezVous", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"rendezVous", "dossierMedical"})
    private List<Ordonnance> ordonnances;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disponibilite_id")
    @JsonIgnoreProperties({"medecin"})
    private Disponibilite disponibilite;
}