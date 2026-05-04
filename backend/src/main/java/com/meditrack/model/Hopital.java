package com.meditrack.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
public class Hopital {
    @Id
    private String id;

    @EqualsAndHashCode.Include
    @Column(nullable = false)
    private String nom;

    private String adresse;

    @Column(nullable = false,unique = true)
    private String email;
    

    @Column(nullable = false,unique = true)
    private String contact;

    @OneToMany(mappedBy = "hopital")
    @JsonIgnoreProperties({"hopital", "motDePasse", "rendezVous", "disponibilites"})
    private List<Utilisateur> utilisateurs;
}
