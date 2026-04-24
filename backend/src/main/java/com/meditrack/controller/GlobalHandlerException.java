package com.meditrack.controller;

import com.meditrack.dto.ErrorResponseDTO;
import com.meditrack.exceptions.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalHandlerException {

    // ─────────────────── 404 Not Found ───────────────────

    @ExceptionHandler(HopitalNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleHopital(HopitalNotFoundException ex) {
        return notFound(ex.getMessage());
    }

    @ExceptionHandler(UtilisateurNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleUtilisateur(UtilisateurNotFoundException ex) {
        return notFound(ex.getMessage());
    }

    @ExceptionHandler(PatientNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handlePatient(PatientNotFoundException ex) {
        return notFound(ex.getMessage());
    }

    @ExceptionHandler(MedecinNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleMedecin(MedecinNotFoundException ex) {
        return notFound(ex.getMessage());
    }

    @ExceptionHandler(SecretaireNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleSecretaire(SecretaireNotFoundException ex) {
        return notFound(ex.getMessage());
    }

    @ExceptionHandler(DossierMedicalNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleDossierMedical(DossierMedicalNotFoundException ex) {
        return notFound(ex.getMessage());
    }

    @ExceptionHandler(RendezVousNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleRendezVous(RendezVousNotFoundException ex) {
        return notFound(ex.getMessage());
    }

    @ExceptionHandler(OrdonnanceNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleOrdonnance(OrdonnanceNotFoundException ex) {
        return notFound(ex.getMessage());
    }

    // ─────────────────── 409 Conflict ───────────────────

    @ExceptionHandler(EmailAlreadyUsedException.class)
    public ResponseEntity<ErrorResponseDTO> handleEmail(EmailAlreadyUsedException ex) {
        return conflict(ex.getMessage());
    }

    @ExceptionHandler(TelephoneAlreadyUsedException.class)
    public ResponseEntity<ErrorResponseDTO> handleTelephone(TelephoneAlreadyUsedException ex) {
        return conflict(ex.getMessage());
    }

    @ExceptionHandler(ConflitRendezVousException.class)
    public ResponseEntity<ErrorResponseDTO> handleConflitRdv(ConflitRendezVousException ex) {
        return conflict(ex.getMessage());
    }

    // ─────────────────── 401 Unauthorized ───────────────────

    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<ErrorResponseDTO> handleTokenExpired(TokenExpiredException ex) {
        ErrorResponseDTO error = new ErrorResponseDTO(ex.getMessage(), HttpStatus.UNAUTHORIZED.value());
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    // ─────────────────── Helpers ───────────────────

    private ResponseEntity<ErrorResponseDTO> notFound(String message) {
        return new ResponseEntity<>(
                new ErrorResponseDTO(message, HttpStatus.NOT_FOUND.value()),
                HttpStatus.NOT_FOUND);
    }

    private ResponseEntity<ErrorResponseDTO> conflict(String message) {
        return new ResponseEntity<>(
                new ErrorResponseDTO(message, HttpStatus.CONFLICT.value()),
                HttpStatus.CONFLICT);
    }
}