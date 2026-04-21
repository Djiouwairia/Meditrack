package com.meditrack.exceptions;

public class HopitalNotFoundException extends RuntimeException {
    public HopitalNotFoundException(String message) {
        super(message);
    }
}
