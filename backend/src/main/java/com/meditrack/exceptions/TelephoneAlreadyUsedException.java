package com.meditrack.exceptions;

public class TelephoneAlreadyUsedException extends RuntimeException {
    public TelephoneAlreadyUsedException(String message) {
        super(message);
    }
}
