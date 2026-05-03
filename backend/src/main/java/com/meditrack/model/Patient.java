package com.meditrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@ToString(callSuper = true)
@PrimaryKeyJoinColumn(name = "id")
public class Patient extends Utilisateur {

    private String adresse;
    private LocalDate dateDeNaissance;
    private String groupeSanguin;
    private String nineaOuCin;
    private String personneDeConfiance;

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"patient", "rendezVous", "ordonnances"})
    private DossierMedical dossierMedical;

    @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<RendezVous> rendezVous;
}