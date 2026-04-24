package com.meditrack.service;

import com.meditrack.dto.MedecinRequestDTO;
import com.meditrack.enums.Role;
import com.meditrack.enums.StatutUtilisateur;
import com.meditrack.exceptions.EmailAlreadyUsedException;
import com.meditrack.exceptions.MedecinNotFoundException;
import com.meditrack.exceptions.TelephoneAlreadyUsedException;
import com.meditrack.model.Hopital;
import com.meditrack.model.Medecin;
import com.meditrack.repository.HopitalRepository;
import com.meditrack.repository.MedecinRepository;
import com.meditrack.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MedecinService {

    private final MedecinRepository medecinRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final HopitalRepository hopitalRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public Medecin createMedecin(MedecinRequestDTO dto) {
        if (utilisateurRepository.findByEmail(dto.getEmail()).isPresent())
            throw new EmailAlreadyUsedException("Cet email est déjà utilisé !");
        if (utilisateurRepository.findByTelephone(dto.getTelephone()).isPresent())
            throw new TelephoneAlreadyUsedException("Ce numéro de téléphone est déjà utilisé !");

        Medecin medecin = new Medecin();
        medecin.setId(generateId());
        medecin.setNom(dto.getNom());
        medecin.setPrenom(dto.getPrenom());
        medecin.setEmail(dto.getEmail());
        medecin.setTelephone(dto.getTelephone());
        medecin.setMotDePasse(passwordEncoder.encode(dto.getMotDePasse()));
        medecin.setSpecialite(dto.getSpecialite());
        medecin.setDisponible(dto.isDisponible());
        medecin.setRole(Role.MEDECIN);
        medecin.setStatutUtilisateur(StatutUtilisateur.ACTIF);

        if (dto.getHopitalId() != null) {
            Hopital hopital = hopitalRepository.findById(dto.getHopitalId())
                    .orElseThrow(() -> new RuntimeException("Hôpital introuvable"));
            medecin.setHopital(hopital);
        }

        return medecinRepository.save(medecin);
    }

    public Page<Medecin> getAllMedecins(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return medecinRepository.findAll(pageable);
    }

    public Page<Medecin> getMedecinsBySpecialite(String specialite, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return medecinRepository.findBySpecialite(specialite, pageable);
    }

    public List<Medecin> getMedecinsDisponibles() {
        return medecinRepository.findByDisponibleTrue();
    }

    public Medecin getMedecinById(String id) {
        return medecinRepository.findById(id)
                .orElseThrow(() -> new MedecinNotFoundException("Médecin introuvable avec l'id : " + id));
    }

    @Transactional
    public Medecin updateMedecin(String id, MedecinRequestDTO dto) {
        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new MedecinNotFoundException("Médecin introuvable avec l'id : " + id));

        if (!medecin.getEmail().equals(dto.getEmail()) &&
                utilisateurRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyUsedException("Cet email est déjà utilisé !");
        }
        if (!medecin.getTelephone().equals(dto.getTelephone()) &&
                utilisateurRepository.findByTelephone(dto.getTelephone()).isPresent()) {
            throw new TelephoneAlreadyUsedException("Ce numéro est déjà utilisé !");
        }

        medecin.setNom(dto.getNom());
        medecin.setPrenom(dto.getPrenom());
        medecin.setEmail(dto.getEmail());
        medecin.setTelephone(dto.getTelephone());
        medecin.setSpecialite(dto.getSpecialite());
        medecin.setDisponible(dto.isDisponible());

        return medecinRepository.save(medecin);
    }

    @Transactional
    public Medecin toggleDisponibilite(String id) {
        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new MedecinNotFoundException("Médecin introuvable avec l'id : " + id));
        medecin.setDisponible(!medecin.isDisponible());
        return medecinRepository.save(medecin);
    }

    public void deleteMedecin(String id) {
        if (!medecinRepository.existsById(id))
            throw new MedecinNotFoundException("Médecin introuvable avec l'id : " + id);
        medecinRepository.deleteById(id);
    }

    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }
}