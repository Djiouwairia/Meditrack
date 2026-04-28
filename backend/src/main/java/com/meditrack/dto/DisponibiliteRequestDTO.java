package com.meditrack.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DisponibiliteRequestDTO {
    private String    medecinId;   // renseigné côté serveur depuis le JWT pour le médecin connecté
    private LocalDate date;
    private LocalTime heureDebut;
    private LocalTime heureFin;
}