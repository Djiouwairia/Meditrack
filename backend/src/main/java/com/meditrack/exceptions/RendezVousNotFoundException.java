package com.meditrack.exceptions;

public class RendezVousNotFoundException extends RuntimeException {
    public RendezVousNotFoundException(String message) {
        super(message);
    }
}