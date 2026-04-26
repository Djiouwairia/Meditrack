package com.meditrack.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class DossierMedical {

    @Id
    private String id;

    @EqualsAndHashCode.Include
    @Column(nullable = false, unique = true)
    private String numero;

    private LocalDate dateDeCreation;
    private String allergies;
    private String poids;
    private String taille;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonBackReference("patient-dossier")
    private Patient patient;

    @OneToMany(mappedBy = "dossierMedical", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("dossier-ordonnances")
    private List<Ordonnance> ordonnances;

    @OneToMany(mappedBy = "dossierMedical", fetch = FetchType.LAZY)
    @JsonManagedReference("dossier-rdv")
    private List<RendezVous> rendezVous;
}