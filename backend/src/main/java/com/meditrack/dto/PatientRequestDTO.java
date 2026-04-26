package com.meditrack.dto;

import com.meditrack.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientRequestDTO {
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String motDePasse;
    private String adresse;
    private LocalDate dateDeNaissance;
    private String groupeSanguin;
    private String hopitalId;
}