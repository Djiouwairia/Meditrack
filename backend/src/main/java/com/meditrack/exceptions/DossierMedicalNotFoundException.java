package com.meditrack.exceptions;

public class DossierMedicalNotFoundException extends RuntimeException {
    public DossierMedicalNotFoundException(String message) {
        super(message);
    }
}