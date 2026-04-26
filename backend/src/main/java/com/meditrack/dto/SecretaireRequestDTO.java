package com.meditrack.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SecretaireRequestDTO {
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String motDePasse;
    private String hopitalId;
}