package com.meditrack.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.meditrack.enums.Role;
import com.meditrack.enums.StatutUtilisateur;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Utilisateur {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Ou GenerationType.IDENTITY selon votre config
    private String id;
    private boolean actif;
    private boolean archive;
    @Column(nullable = false,length = 30)
    private String nom ;
    @Column(nullable = false,length = 50)
    private String prenom;
    @Column(nullable = false,unique = true)
    private String email;
    @Column(nullable = false,unique = true)
    private String telephone;
    private String motDePasse;
    @Enumerated(EnumType.STRING)
    private Role role ;
    @Enumerated(EnumType.STRING)
    private StatutUtilisateur statutUtilisateur;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hopital_id")
    @JsonBackReference
    private Hopital hopital;

    // IMPLÉMENTEZ LES SETTERS
    public void setActif(boolean actif) {
        this.actif = actif;
    }

    public void setArchive(boolean archive) {
        this.archive = archive;
    }
}
