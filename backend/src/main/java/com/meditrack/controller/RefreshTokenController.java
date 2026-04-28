package com.meditrack.controller;

import com.meditrack.model.RefreshToken;
import com.meditrack.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class RefreshTokenController {

    private final RefreshTokenService refreshTokenService;


    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {

        String refreshTokenValue = request.get("refreshToken");

        if (refreshTokenValue == null || refreshTokenValue.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Refresh token manquant"));
        }

        RefreshToken refreshToken = refreshTokenService.findByToken(refreshTokenValue);

        refreshTokenService.verifyExpiration(refreshToken);

        String newAccessToken = refreshTokenService.generateNewToken(refreshToken);

        return ResponseEntity.ok(Map.of(
                "accessToken", newAccessToken
        ));
    }
}