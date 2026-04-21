package com.meditrack.controller;

import com.meditrack.model.Hopital;
import com.meditrack.service.HopitalService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/hopital")
public class HopitalController {
    private final HopitalService hopitalService;
    @PostMapping
    public ResponseEntity<Hopital> createHopital(@RequestBody Hopital hopital) {
        return new ResponseEntity<>(hopitalService.createHopital(hopital), HttpStatus.CREATED);
    }
    @GetMapping
    public ResponseEntity<Page<Hopital>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "nom") String sortBy

    ) {
        return new ResponseEntity<>(hopitalService.getAllHopitals(page,size,sortBy),HttpStatus.OK);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Optional<Hopital>> findHopitalById(@PathVariable String id) {
        return new ResponseEntity<>(hopitalService.getHopitalById(id),HttpStatus.OK);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Hopital> deleteHopital(@PathVariable String id) {
        hopitalService.deleteHopital(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
    @PutMapping("/{id}")
    public ResponseEntity<Hopital> updateHopital(@PathVariable String id,@RequestBody Hopital hopital) {

        return new ResponseEntity<>(hopitalService.updateHopital(id,hopital),HttpStatus.OK);
    }
}
