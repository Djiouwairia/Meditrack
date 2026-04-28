package com.meditrack.repository;

import com.meditrack.model.Disponibilite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DisponibiliteRepository extends JpaRepository<Disponibilite, String> {

    /** Toutes les dispos d'un médecin à partir d'aujourd'hui */
    @Query("SELECT d FROM Disponibilite d WHERE d.medecin.id = :medecinId AND d.date >= :from ORDER BY d.date, d.heureDebut")
    List<Disponibilite> findByMedecinIdFromDate(@Param("medecinId") String medecinId,
                                                @Param("from") LocalDate from);

    /** Uniquement les créneaux libres (non réservés) */
    @Query("SELECT d FROM Disponibilite d WHERE d.medecin.id = :medecinId AND d.estReserve = false AND d.date >= :from ORDER BY d.date, d.heureDebut")
    List<Disponibilite> findLibresByMedecinId(@Param("medecinId") String medecinId,
                                              @Param("from") LocalDate from);

    /** Vérifier conflit de créneau (même médecin, même date, chevauchement horaire) */
    @Query("""
        SELECT COUNT(d) > 0 FROM Disponibilite d
        WHERE d.medecin.id = :medecinId
          AND d.date = :date
          AND d.heureDebut < :heureFin
          AND d.heureFin  > :heureDebut
    """)
    boolean existsConflict(@Param("medecinId") String medecinId,
                           @Param("date")      LocalDate date,
                           @Param("heureDebut") java.time.LocalTime heureDebut,
                           @Param("heureFin")   java.time.LocalTime heureFin);
}