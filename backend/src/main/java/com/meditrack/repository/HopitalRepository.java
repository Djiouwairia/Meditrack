package com.meditrack.repository;

import com.meditrack.model.Hopital;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface HopitalRepository extends JpaRepository<Hopital, String> {
    Page<Hopital> findAll(Pageable pageable);
    Optional<Hopital> findByEmail(String email);

    Optional<Hopital> findByContact(String contact);
}
