package com.meditrack.repository;

import com.meditrack.enums.StatutRendezVous;
import com.meditrack.model.RendezVous;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface RendezVousRepository extends JpaRepository<RendezVous, String> {

    Page<RendezVous> findByMedecinId(String medecinId, Pageable pageable);
    Page<RendezVous> findByPatientId(String patientId, Pageable pageable);
    Page<RendezVous> findByStatut(StatutRendezVous statut, Pageable pageable);

    // Tous les RDV triés par date (pour admin/secrétaire)
    Page<RendezVous> findAll(Pageable pageable);

    List<RendezVous> findByMedecinIdAndDate(String medecinId, LocalDate date);

    // Vérifier si un médecin a déjà un rendez-vous à cette date/heure
    boolean existsByMedecinIdAndDateAndHeure(String medecinId, LocalDate date, LocalTime heure);

    // Agenda médecin pour une période
    @Query("SELECT r FROM RendezVous r WHERE r.medecin.id = :medecinId AND r.date BETWEEN :debut AND :fin ORDER BY r.date, r.heure")
    List<RendezVous> findAgendaMedecin(@Param("medecinId") String medecinId,
                                       @Param("debut") LocalDate debut,
                                       @Param("fin") LocalDate fin);
}