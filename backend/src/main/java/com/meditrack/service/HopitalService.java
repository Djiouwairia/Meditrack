package com.meditrack.service;

import com.meditrack.exceptions.EmailAlreadyUsedException;
import com.meditrack.exceptions.HopitalNotFoundException;
import com.meditrack.exceptions.TelephoneAlreadyUsedException;
import com.meditrack.model.Hopital;
import com.meditrack.repository.HopitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HopitalService {
    private final HopitalRepository hopitalRepository;

    public Hopital createHopital(Hopital hopital) {
        if (hopitalRepository.findByEmail(hopital.getEmail()).isPresent()) throw new EmailAlreadyUsedException("Cet email est déja utilisé !");
        if (hopitalRepository.findByContact(hopital.getContact()).isPresent()) throw new TelephoneAlreadyUsedException("Ce contact est déjà utilisé !");
        hopital.setId(UUID.randomUUID().toString().replace("-", "").substring(1,8));
        return hopitalRepository.save(hopital);
    }
    public Page<Hopital> getAllHopitals(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return hopitalRepository.findAll(pageable);
    }
    public Optional<Hopital> getHopitalById(String id) {
        Optional<Hopital> hopitalOptional = hopitalRepository.findById(id);
        if (hopitalOptional.isPresent()) {
            return hopitalRepository.findById(id);
        }
        else throw new HopitalNotFoundException("Hopital introuvable");
    }
    public void deleteHopital(String id) {
        Optional<Hopital> hopitalOptional = hopitalRepository.findById(id);
        if (hopitalOptional.isPresent()) {
            hopitalRepository.deleteById(id);
        }
        else throw new HopitalNotFoundException("Hopital introuvable");
    }
    public Hopital updateHopital(String id, Hopital hopital) {
        Optional<Hopital> hopitalOptional = hopitalRepository.findById(id);
        if (hopitalOptional.isPresent()) {
            Hopital hopitalToUpdate = hopitalOptional.get();
            hopitalToUpdate.setContact(hopital.getContact());
            hopitalToUpdate.setEmail(hopital.getEmail());
            hopitalToUpdate.setAdresse(hopital.getAdresse());
            return hopitalRepository.save(hopitalToUpdate);
        }
        else throw new HopitalNotFoundException("Hopital introuvable");
    }


}
