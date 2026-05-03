package com.meditrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    
    // Constantes cliniques supplémentaires
    private String tension;
    private String temperature;

    // Antécédents
    @Column(columnDefinition = "TEXT")
    private String antecedents;
    
    // Terrain (Maladies passées/non traitées)
    @Column(columnDefinition = "TEXT")
    private String terrain;

    // Carnet de Santé
    @Column(columnDefinition = "TEXT")
    private String suiviPrenatal;
    @Column(columnDefinition = "TEXT")
    private String suiviInfantile;
    private String preventionPaludisme;

    // Résultats Paracliniques
    @Column(columnDefinition = "TEXT")
    private String analysesBiologiques;
    @Column(columnDefinition = "TEXT")
    private String imagerie;
    @Column(columnDefinition = "TEXT")
    private String rapportsSpecialistes;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnoreProperties({"dossierMedical", "rendezVous", "motDePasse"})
    private Patient patient;

    @OneToMany(mappedBy = "dossierMedical", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"dossierMedical", "rendezVous"})
    private List<Ordonnance> ordonnances;

    @OneToMany(mappedBy = "dossierMedical", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<RendezVous> rendezVous;
}