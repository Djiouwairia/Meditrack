package com.meditrack.service;

import com.meditrack.enums.StatutUtilisateur;
import com.meditrack.exceptions.EmailAlreadyUsedException;
import com.meditrack.exceptions.UtilisateurNotFoundException;
import com.meditrack.exceptions.TelephoneAlreadyUsedException;
import com.meditrack.model.Hopital;
import com.meditrack.model.Utilisateur;
import com.meditrack.repository.HopitalRepository;
import com.meditrack.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UtilisateurService {
    private final UtilisateurRepository utilisateurRepository;

    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final HopitalRepository hopitalRepository;

    public Utilisateur createUtilisateur(Utilisateur utilisateur) {
        if (utilisateurRepository.findByEmail(utilisateur.getEmail()).isPresent()) throw new EmailAlreadyUsedException("Cet email est déja utilisé !");
        if (utilisateurRepository.findByTelephone(utilisateur.getTelephone()).isPresent()) throw new TelephoneAlreadyUsedException("Ce contact est déjà utilisé !");
        utilisateur.setId(UUID.randomUUID().toString().replace("-", "").substring(1,8));
        utilisateur.setMotDePasse(bCryptPasswordEncoder.encode(utilisateur.getMotDePasse()));
        return utilisateurRepository.save(utilisateur);
    }

    public Utilisateur createUtilisateurWithHopital(Utilisateur utilisateur, String idHopital) {
        if (utilisateurRepository.findByEmail(utilisateur.getEmail()).isPresent()) throw new EmailAlreadyUsedException("Cet email est déja utilisé !");
        if (utilisateurRepository.findByTelephone(utilisateur.getTelephone()).isPresent()) throw new TelephoneAlreadyUsedException("Ce contact est déjà utilisé !");
        Hopital hopital = hopitalRepository.findById(idHopital).get();
        utilisateur.setId(UUID.randomUUID().toString().replace("-", "").substring(1,8));
        utilisateur.setMotDePasse(bCryptPasswordEncoder.encode(utilisateur.getMotDePasse()));
        utilisateur.setHopital(hopital);
        return utilisateurRepository.save(utilisateur);
    }

    public Page<Utilisateur> getAllUtilisateurs(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return utilisateurRepository.findAll(pageable);
    }

    public Optional<Utilisateur> getUtilisateurById(String id) {
        Optional<Utilisateur> utilisateurOptional = utilisateurRepository.findById(id);
        if (utilisateurOptional.isPresent()) {
            return utilisateurRepository.findById(id);
        }
        else throw new UtilisateurNotFoundException("Utilisateur introuvable");
    }

    public void deleteUtilisateur(String id) {
        Optional<Utilisateur> utilisateurOptional = utilisateurRepository.findById(id);
        if (utilisateurOptional.isPresent()) {
            utilisateurRepository.deleteById(id);
        }
        else throw new UtilisateurNotFoundException("Utilisateur introuvable");
    }

    public Utilisateur updateUtilisateur(String id, Utilisateur utilisateur) {
        Optional<Utilisateur> utilisateurOptional = utilisateurRepository.findById(id);
        if (utilisateurOptional.isPresent()) {
            Utilisateur utilisateurToUpdate = utilisateurOptional.get();
            utilisateurToUpdate.setNom(utilisateur.getNom());
            utilisateurToUpdate.setPrenom(utilisateur.getPrenom());
            utilisateurToUpdate.setTelephone(utilisateur.getTelephone());
            utilisateurToUpdate.setEmail(utilisateur.getEmail());
            utilisateurToUpdate.setRole(utilisateur.getRole());
            utilisateurToUpdate.setStatutUtilisateur(utilisateur.getStatutUtilisateur());
            utilisateurToUpdate.setMotDePasse(utilisateur.getMotDePasse());
            utilisateurToUpdate.setHopital(utilisateur.getHopital());
            return utilisateurRepository.save(utilisateurToUpdate);
        }
        else throw new UtilisateurNotFoundException("Utilisateur introuvable");
    }

    public Utilisateur activerUtilisateur(String id) {
        Optional<Utilisateur> utilisateurOptional = utilisateurRepository.findById(id);
        if (utilisateurOptional.isPresent()){
            Utilisateur utilisateurToUpdate = utilisateurOptional.get();
            utilisateurToUpdate.setStatutUtilisateur(StatutUtilisateur.ACTIF);
            return utilisateurRepository.save(utilisateurToUpdate);
        }
        else throw new UtilisateurNotFoundException("Utilisateur introuvable");
    }

    public Utilisateur desactiverUtilisateur(String id) {
        Optional<Utilisateur> utilisateurOptional = utilisateurRepository.findById(id);
        if (utilisateurOptional.isPresent()){
            Utilisateur utilisateurToUpdate = utilisateurOptional.get();
            utilisateurToUpdate.setStatutUtilisateur(StatutUtilisateur.INACTIF);
            return utilisateurRepository.save(utilisateurToUpdate);
        }
        else throw new UtilisateurNotFoundException("Utilisateur introuvable");
    }

    public Utilisateur archiverUtilisateur(String id) {
        Optional<Utilisateur> utilisateurOptional = utilisateurRepository.findById(id);
        if (utilisateurOptional.isPresent()){
            Utilisateur utilisateurToUpdate = utilisateurOptional.get();
            utilisateurToUpdate.setStatutUtilisateur(StatutUtilisateur.ARCHIVE);
            return utilisateurRepository.save(utilisateurToUpdate);
        }
        else throw new UtilisateurNotFoundException("Utilisateur introuvable");
    }

    public Utilisateur desarchiverUtilisateur(String id) {
        Optional<Utilisateur> utilisateurOptional = utilisateurRepository.findById(id);
        if (utilisateurOptional.isPresent()){
            Utilisateur utilisateurToUpdate = utilisateurOptional.get();
            utilisateurToUpdate.setStatutUtilisateur(StatutUtilisateur.ACTIF);
            return utilisateurRepository.save(utilisateurToUpdate);
        }
        else throw new UtilisateurNotFoundException("Utilisateur introuvable");
    }
}
