package com.meditrack.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
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

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("patient-dossier")
    private DossierMedical dossierMedical;

    @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY)
    @JsonManagedReference("patient-rdv")
    private List<RendezVous> rendezVous;
}