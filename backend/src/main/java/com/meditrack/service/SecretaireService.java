package com.meditrack.service;

import com.meditrack.dto.SecretaireRequestDTO;
import com.meditrack.enums.Role;
import com.meditrack.enums.StatutUtilisateur;
import com.meditrack.exceptions.EmailAlreadyUsedException;
import com.meditrack.exceptions.SecretaireNotFoundException;
import com.meditrack.exceptions.TelephoneAlreadyUsedException;
import com.meditrack.model.Hopital;
import com.meditrack.model.Secretaire;
import com.meditrack.repository.HopitalRepository;
import com.meditrack.repository.SecretaireRepository;
import com.meditrack.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SecretaireService {

    private final SecretaireRepository secretaireRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final HopitalRepository hopitalRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public Secretaire createSecretaire(SecretaireRequestDTO dto) {
        if (utilisateurRepository.findByEmail(dto.getEmail()).isPresent())
            throw new EmailAlreadyUsedException("Cet email est déjà utilisé !");
        if (utilisateurRepository.findByTelephone(dto.getTelephone()).isPresent())
            throw new TelephoneAlreadyUsedException("Ce numéro de téléphone est déjà utilisé !");

        Secretaire secretaire = new Secretaire();
        secretaire.setId(generateId());
        secretaire.setNom(dto.getNom());
        secretaire.setPrenom(dto.getPrenom());
        secretaire.setEmail(dto.getEmail());
        secretaire.setTelephone(dto.getTelephone());
        secretaire.setMotDePasse(passwordEncoder.encode(dto.getMotDePasse()));
        secretaire.setRole(Role.SECRETAIRE);
        secretaire.setStatutUtilisateur(StatutUtilisateur.ACTIF);

        if (dto.getHopitalId() != null) {
            Hopital hopital = hopitalRepository.findById(dto.getHopitalId())
                    .orElseThrow(() -> new RuntimeException("Hôpital introuvable"));
            secretaire.setHopital(hopital);
        }

        return secretaireRepository.save(secretaire);
    }

    public Page<Secretaire> getAllSecretaires(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return secretaireRepository.findAll(pageable);
    }

    public Secretaire getSecretaireById(String id) {
        return secretaireRepository.findById(id)
                .orElseThrow(() -> new SecretaireNotFoundException("Secrétaire introuvable avec l'id : " + id));
    }

    @Transactional
    public Secretaire updateSecretaire(String id, SecretaireRequestDTO dto) {
        Secretaire secretaire = secretaireRepository.findById(id)
                .orElseThrow(() -> new SecretaireNotFoundException("Secrétaire introuvable avec l'id : " + id));

        if (!secretaire.getEmail().equals(dto.getEmail()) &&
                utilisateurRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyUsedException("Cet email est déjà utilisé !");
        }
        if (!secretaire.getTelephone().equals(dto.getTelephone()) &&
                utilisateurRepository.findByTelephone(dto.getTelephone()).isPresent()) {
            throw new TelephoneAlreadyUsedException("Ce numéro est déjà utilisé !");
        }

        secretaire.setNom(dto.getNom());
        secretaire.setPrenom(dto.getPrenom());
        secretaire.setEmail(dto.getEmail());
        secretaire.setTelephone(dto.getTelephone());

        return secretaireRepository.save(secretaire);
    }

    public void deleteSecretaire(String id) {
        if (!secretaireRepository.existsById(id))
            throw new SecretaireNotFoundException("Secrétaire introuvable avec l'id : " + id);
        secretaireRepository.deleteById(id);
    }

    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }
}