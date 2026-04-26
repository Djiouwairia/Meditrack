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
}