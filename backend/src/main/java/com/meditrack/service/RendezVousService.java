package com.meditrack.service;

import com.meditrack.dto.RendezVousRequestDTO;
import com.meditrack.enums.StatutRendezVous;
import com.meditrack.exceptions.ConflitRendezVousException;
import com.meditrack.exceptions.MedecinNotFoundException;
import com.meditrack.exceptions.PatientNotFoundException;
import com.meditrack.exceptions.RendezVousNotFoundException;
import com.meditrack.model.DossierMedical;
import com.meditrack.model.Medecin;
import com.meditrack.model.Patient;
import com.meditrack.model.RendezVous;
import com.meditrack.repository.DossierMedicalRepository;
import com.meditrack.repository.MedecinRepository;
import com.meditrack.repository.PatientRepository;
import com.meditrack.repository.RendezVousRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RendezVousService {

    private final RendezVousRepository rendezVousRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final DossierMedicalRepository dossierMedicalRepository;
    private final com.meditrack.repository.DisponibiliteRepository disponibiliteRepository;
    private final NotificationService notificationService;

    /**
     * Prise de rendez-vous par un patient ou une secrétaire
     */
    @Transactional
    public RendezVous prendreRendezVous(RendezVousRequestDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException("Patient introuvable : " + dto.getPatientId()));

        Medecin medecin = medecinRepository.findById(dto.getMedecinId())
                .orElseThrow(() -> new MedecinNotFoundException("Médecin introuvable : " + dto.getMedecinId()));

        com.meditrack.model.Disponibilite dispoToSave = null;
        if (dto.getDisponibiliteId() != null && !dto.getDisponibiliteId().isBlank()) {
            com.meditrack.model.Disponibilite dispo = disponibiliteRepository.findById(dto.getDisponibiliteId())
                    .orElseThrow(() -> new IllegalArgumentException("Créneau introuvable"));
            if (dispo.isEstReserve() || dispo.getPlacesRestantes() <= 0) {
                throw new ConflitRendezVousException("Ce créneau est complet.");
            }
            dispo.setPlacesRestantes(dispo.getPlacesRestantes() - 1);
            if (dispo.getPlacesRestantes() <= 0) {
                dispo.setEstReserve(true);
            }
            dispoToSave = disponibiliteRepository.save(dispo);
        }

        // Vérifier conflit de créneau (uniquement si aucune disponibilité pré-définie n'est utilisée)
        if (dispoToSave == null && rendezVousRepository.existsByMedecinIdAndDateAndHeure(
                dto.getMedecinId(), dto.getDate(), dto.getHeure())) {
            throw new ConflitRendezVousException(
                    "Le médecin a déjà un rendez-vous le " + dto.getDate() + " à " + dto.getHeure());
        }

        RendezVous rdv = new RendezVous();
        rdv.setId(generateId());
        rdv.setDate(dto.getDate());
        rdv.setHeure(dto.getHeure());
        rdv.setMotif(dto.getMotif());
        rdv.setStatut(StatutRendezVous.EN_ATTENTE);
        rdv.setPatient(patient);
        rdv.setMedecin(medecin);
        if (dispoToSave != null) {
            rdv.setDisponibilite(dispoToSave);
        }

        // Lier au dossier médical du patient
        dossierMedicalRepository.findByPatientId(patient.getId())
                .ifPresent(rdv::setDossierMedical);

        RendezVous savedRdv = rendezVousRepository.save(rdv);
        
        notificationService.createNotification(
            medecin.getId(),
            "Nouveau Rendez-vous",
            "Le patient " + patient.getPrenom() + " " + patient.getNom() + " a réservé un rendez-vous le " + dto.getDate() + " à " + dto.getHeure()
        );

        return savedRdv;
    }

    public Page<RendezVous> getRendezVousByMedecin(String medecinId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());
        return rendezVousRepository.findByMedecinId(medecinId, pageable);
    }

    public Page<RendezVous> getRendezVousByPatient(String patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());
        return rendezVousRepository.findByPatientId(patientId, pageable);
    }

    /**
     * Tous les rendez-vous (pour secrétaire/admin), filtrés optionnellement par statut
     */
    public Page<RendezVous> getAllRendezVous(String statut, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());
        if (statut != null && !statut.isBlank()) {
            StatutRendezVous s = StatutRendezVous.valueOf(statut);
            return rendezVousRepository.findByStatut(s, pageable);
        }
        return rendezVousRepository.findAll(pageable);
    }

    /**
     * Agenda du médecin pour une période donnée
     */
    public List<RendezVous> getAgendaMedecin(String medecinId, LocalDate debut, LocalDate fin) {
        if (!medecinRepository.existsById(medecinId))
            throw new MedecinNotFoundException("Médecin introuvable : " + medecinId);
        return rendezVousRepository.findAgendaMedecin(medecinId, debut, fin);
    }

    /**
     * Agenda du jour pour un médecin
     */
    public List<RendezVous> getAgendaAujourdhui(String medecinId) {
        LocalDate today = LocalDate.now();
        return rendezVousRepository.findByMedecinIdAndDate(medecinId, today);
    }

    public RendezVous getRendezVousById(String id) {
        return rendezVousRepository.findById(id)
                .orElseThrow(() -> new RendezVousNotFoundException("Rendez-vous introuvable : " + id));
    }

    @Transactional
    public RendezVous confirmerRendezVous(String id) {
        RendezVous rdv = getRendezVousById(id);
        rdv.setStatut(StatutRendezVous.CONFIRME);
        RendezVous saved = rendezVousRepository.save(rdv);
        
        notificationService.createNotification(
            rdv.getPatient().getId(),
            "Rendez-vous Confirmé",
            "Votre rendez-vous du " + rdv.getDate() + " avec le Dr. " + rdv.getMedecin().getNom() + " a été confirmé."
        );
        
        return saved;
    }

    @Transactional
    public RendezVous annulerRendezVous(String id) {
        RendezVous rdv = getRendezVousById(id);
        if (rdv.getStatut() != StatutRendezVous.ANNULE) {
            rdv.setStatut(StatutRendezVous.ANNULE);
            if (rdv.getDisponibilite() != null) {
                com.meditrack.model.Disponibilite dispo = rdv.getDisponibilite();
                dispo.setPlacesRestantes(dispo.getPlacesRestantes() + 1);
                dispo.setEstReserve(false);
                disponibiliteRepository.save(dispo);
            }
            
            notificationService.createNotification(
                rdv.getPatient().getId(),
                "Rendez-vous Annulé",
                "Votre rendez-vous du " + rdv.getDate() + " avec le Dr. " + rdv.getMedecin().getNom() + " a été annulé."
            );
            
            notificationService.createNotification(
                rdv.getMedecin().getId(),
                "Rendez-vous Annulé",
                "Le rendez-vous du " + rdv.getDate() + " avec le patient " + rdv.getPatient().getPrenom() + " " + rdv.getPatient().getNom() + " a été annulé."
            );
        }
        return rendezVousRepository.save(rdv);
    }

    @Transactional
    public RendezVous terminerRendezVous(String id, String diagnostic) {
        RendezVous rdv = getRendezVousById(id);
        rdv.setStatut(StatutRendezVous.TERMINE);
        rdv.setDiagnostic(diagnostic);
        return rendezVousRepository.save(rdv);
    }

    @Transactional
    public void deleteRendezVous(String id) {
        RendezVous rdv = rendezVousRepository.findById(id).orElse(null);
        if (rdv == null) return;
        
        if (rdv.getStatut() != StatutRendezVous.ANNULE && rdv.getStatut() != StatutRendezVous.TERMINE && rdv.getDisponibilite() != null) {
            com.meditrack.model.Disponibilite dispo = rdv.getDisponibilite();
            dispo.setPlacesRestantes(dispo.getPlacesRestantes() + 1);
            dispo.setEstReserve(false);
            disponibiliteRepository.save(dispo);
        }
        
        rendezVousRepository.deleteById(id);
    }

    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }
}