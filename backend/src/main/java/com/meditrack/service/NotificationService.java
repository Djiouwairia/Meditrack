package com.meditrack.service;

import com.meditrack.dto.NotificationDTO;
import com.meditrack.model.Notification;
import com.meditrack.model.Utilisateur;
import com.meditrack.repository.NotificationRepository;
import com.meditrack.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Transactional
    public void createNotification(String utilisateurId, String titre, String message) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId).orElse(null);
        if (utilisateur == null) return;

        // Ici, on pourrait ajouter une logique pour vérifier les préférences
        // if (utilisateur.isNotificationsEmail()) { sendEmail(utilisateur.getEmail(), message); }
        // if (utilisateur.isNotificationsSms()) { sendSms(utilisateur.getTelephone(), message); }

        Notification notif = new Notification();
        notif.setUtilisateur(utilisateur);
        notif.setTitre(titre);
        notif.setMessage(message);
        notificationRepository.save(notif);
    }

    public Page<NotificationDTO> getNotificationsForUser(String utilisateurId, int page, int size) {
        Page<Notification> notifs = notificationRepository.findByUtilisateurId(
                utilisateurId, 
                PageRequest.of(page, size, Sort.by("dateCreation").descending())
        );
        return notifs.map(n -> {
            NotificationDTO dto = new NotificationDTO();
            dto.setId(n.getId());
            dto.setTitre(n.getTitre());
            dto.setMessage(n.getMessage());
            dto.setLue(n.isLue());
            dto.setDateCreation(n.getDateCreation());
            return dto;
        });
    }

    public long countUnread(String utilisateurId) {
        return notificationRepository.countByUtilisateurIdAndLueFalse(utilisateurId);
    }

    @Transactional
    public void markAsRead(String id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setLue(true);
            notificationRepository.save(n);
        });
    }
}
