package com.meditrack.exceptions;

public class SecretaireNotFoundException extends RuntimeException {
    public SecretaireNotFoundException(String message) {
        super(message);
    }
}