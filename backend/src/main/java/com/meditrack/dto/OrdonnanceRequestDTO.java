package com.meditrack.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrdonnanceRequestDTO {
    private String rendezVousId;
    // Clé = nom du médicament, Valeur = posologie/instructions
    private Map<String, String> medicaments;
}