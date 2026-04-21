package com.meditrack.controller;

import com.meditrack.dto.ErrorResponseDTO;
import com.meditrack.exceptions.EmailAlreadyUsedException;
import com.meditrack.exceptions.HopitalNotFoundException;
import com.meditrack.exceptions.TelephoneAlreadyUsedException;
import com.meditrack.exceptions.UtilisateurNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalHandlerException {
    @ExceptionHandler(HopitalNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleHopitalException(HopitalNotFoundException ex) {
        ErrorResponseDTO errorResponseDTO = new ErrorResponseDTO(ex.getMessage(), HttpStatus.NOT_FOUND.value());
        return  new ResponseEntity<>(errorResponseDTO, HttpStatus.NOT_FOUND);
    }
    @ExceptionHandler(UtilisateurNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleUtilisateurException(UtilisateurNotFoundException ex) {
        ErrorResponseDTO errorResponseDTO = new ErrorResponseDTO(ex.getMessage(), HttpStatus.NOT_FOUND.value());
        return  new ResponseEntity<>(errorResponseDTO, HttpStatus.NOT_FOUND);
    }
    @ExceptionHandler(EmailAlreadyUsedException.class)
    public ResponseEntity<ErrorResponseDTO> handleEmailException(EmailAlreadyUsedException ex) {
        ErrorResponseDTO errorResponseDTO = new ErrorResponseDTO(ex.getMessage(), HttpStatus.NOT_FOUND.value());
        return  new ResponseEntity<>(errorResponseDTO, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(TelephoneAlreadyUsedException.class)
    public ResponseEntity<ErrorResponseDTO> handleTelephoneException(TelephoneAlreadyUsedException ex) {
        ErrorResponseDTO errorResponseDTO = new ErrorResponseDTO(ex.getMessage(), HttpStatus.NOT_FOUND.value());
        return  new ResponseEntity<>(errorResponseDTO, HttpStatus.NOT_FOUND);
    }
}
