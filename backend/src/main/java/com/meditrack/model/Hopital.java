package com.meditrack.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
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
    @JsonManagedReference
    private List<Utilisateur> utilisateurs;
}
