package com.meditrack.exceptions;

public class OrdonnanceNotFoundException extends RuntimeException {
    public OrdonnanceNotFoundException(String message) {
        super(message);
    }
}