package com.meditrack.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DossierMedicalRequestDTO {
    private String patientId;
    private String allergies;
    private String poids;
    private String taille;
    private String tension;
    private String temperature;
    private String antecedents;
    private String terrain;
    private String suiviPrenatal;
    private String suiviInfantile;
    private String preventionPaludisme;
    private String analysesBiologiques;
    private String imagerie;
    private String rapportsSpecialistes;
}