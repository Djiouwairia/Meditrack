package com.meditrack.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.Map;

@Entity
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class Ordonnance {

    @Id
    @EqualsAndHashCode.Include
    private String id;

    @Column(nullable = false)
    private LocalDate date;

    // Clé = médicament, Valeur = posologie
    @ElementCollection
    @CollectionTable(name = "ordonnance_medicaments", joinColumns = @JoinColumn(name = "ordonnance_id"))
    @MapKeyColumn(name = "medicament")
    @Column(name = "posologie")
    private Map<String, String> medicaments;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rendez_vous_id", nullable = false)
    @JsonBackReference
    private RendezVous rendezVous;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_medical_id", nullable = false)
    @JsonBackReference("dossier-ordonnances")
    private DossierMedical dossierMedical;
}