package com.meditrack.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    @JsonIgnoreProperties({"hopital", "motDePasse", "dossierMedical", "rendezVous"})
    private Utilisateur utilisateur;

    @Column(nullable = false)
    private String titre;

    @Column(nullable = false)
    private String message;

    private boolean lue = false;

    private LocalDateTime dateCreation = LocalDateTime.now();
}
