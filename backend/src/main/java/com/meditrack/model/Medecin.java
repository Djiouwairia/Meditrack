package com.meditrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Entity
@Getter
@Setter
@ToString(callSuper = true)
@PrimaryKeyJoinColumn(name = "id")
public class Medecin extends Utilisateur {

    private String specialite;
    private boolean disponible;

    @OneToMany(mappedBy = "medecin", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<RendezVous> rendezVous;
}