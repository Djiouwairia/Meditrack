package com.meditrack.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.meditrack.enums.Role;
import com.meditrack.enums.Sexe;
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
@Inheritance(strategy = InheritanceType.JOINED)
public class Utilisateur {
    @Id
    private String id;
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
    @Enumerated(EnumType.STRING)
    private Sexe sexe;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hopital_id")
    @JsonIgnoreProperties({"utilisateurs"})
    private Hopital hopital;


}
