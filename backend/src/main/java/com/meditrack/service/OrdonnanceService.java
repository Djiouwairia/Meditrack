package com.meditrack.service;

import com.meditrack.dto.OrdonnanceRequestDTO;
import com.meditrack.exceptions.DossierMedicalNotFoundException;
import com.meditrack.exceptions.OrdonnanceNotFoundException;
import com.meditrack.exceptions.RendezVousNotFoundException;
import com.meditrack.model.DossierMedical;
import com.meditrack.model.Ordonnance;
import com.meditrack.model.RendezVous;
import com.meditrack.repository.DossierMedicalRepository;
import com.meditrack.repository.OrdonnanceRepository;
import com.meditrack.repository.RendezVousRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrdonnanceService {

    private final OrdonnanceRepository ordonnanceRepository;
    private final RendezVousRepository rendezVousRepository;
    private final DossierMedicalRepository dossierMedicalRepository;

    @Transactional
    public Ordonnance creerOrdonnance(OrdonnanceRequestDTO dto) {
        RendezVous rdv = rendezVousRepository.findById(dto.getRendezVousId())
                .orElseThrow(() -> new RendezVousNotFoundException(
                        "Rendez-vous introuvable : " + dto.getRendezVousId()));

        DossierMedical dossier = dossierMedicalRepository.findByPatientId(rdv.getPatient().getId())
                .orElseThrow(() -> new DossierMedicalNotFoundException(
                        "Dossier médical introuvable pour le patient du rendez-vous"));

        Ordonnance ordonnance = new Ordonnance();
        ordonnance.setId(generateId());
        ordonnance.setDate(LocalDate.now());
        ordonnance.setMedicaments(dto.getMedicaments());
        ordonnance.setRendezVous(rdv);
        ordonnance.setDossierMedical(dossier);

        return ordonnanceRepository.save(ordonnance);
    }

    public Page<Ordonnance> getOrdonnancesByDossier(String dossierMedicalId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());
        return ordonnanceRepository.findByDossierMedicalId(dossierMedicalId, pageable);
    }

    public Page<Ordonnance> getOrdonnancesByRendezVous(String rendezVousId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ordonnanceRepository.findByRendezVousId(rendezVousId, pageable);
    }

    public Ordonnance getOrdonnanceById(String id) {
        return ordonnanceRepository.findById(id)
                .orElseThrow(() -> new OrdonnanceNotFoundException("Ordonnance introuvable : " + id));
    }

    public void deleteOrdonnance(String id) {
        if (!ordonnanceRepository.existsById(id))
            throw new OrdonnanceNotFoundException("Ordonnance introuvable : " + id);
        ordonnanceRepository.deleteById(id);
    }

    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }
}