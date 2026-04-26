package com.meditrack.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Entity
@Getter
@Setter
@ToString(callSuper = true)
public class Medecin extends Utilisateur {

    private String specialite;
    private boolean disponible;

    @OneToMany(mappedBy = "medecin", fetch = FetchType.LAZY)
    @JsonManagedReference("medecin-rdv")
    private List<RendezVous> rendezVous;
}