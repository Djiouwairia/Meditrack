package com.meditrack.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RendezVousRequestDTO {
    private String patientId;
    private String medecinId;
    private LocalDate date;
    private LocalTime heure;
    private String motif;
}