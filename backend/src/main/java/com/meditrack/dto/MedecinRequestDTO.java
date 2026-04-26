package com.meditrack.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedecinRequestDTO {
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String motDePasse;
    private String specialite;
    private boolean disponible;
    private String hopitalId;
}