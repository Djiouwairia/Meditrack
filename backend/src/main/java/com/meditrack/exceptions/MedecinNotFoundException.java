package com.meditrack.exceptions;

public class MedecinNotFoundException extends RuntimeException {
    public MedecinNotFoundException(String message) {
        super(message);
    }
}