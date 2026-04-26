package com.meditrack.model;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString(callSuper = true)
public class Secretaire extends Utilisateur {
    // La secrétaire gère les rendez-vous des médecins
}