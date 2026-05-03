package com.meditrack.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private String id;
    private String titre;
    private String message;
    private boolean lue;
    private LocalDateTime dateCreation;
}
