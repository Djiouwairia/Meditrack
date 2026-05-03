package com.meditrack.repository;

import com.meditrack.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, String> {
    Page<Notification> findByUtilisateurId(String utilisateurId, Pageable pageable);
    long countByUtilisateurIdAndLueFalse(String utilisateurId);
}
