package com.meditrack.controller;

import com.meditrack.dto.LoginDTO;
import com.meditrack.model.RefreshToken;
import com.meditrack.service.JwtService;
import com.meditrack.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class LoginController {

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getPassword())
        );

        String accessToken = jwtService.generateAccessToken(loginDTO.getEmail());
        RefreshToken refreshToken = refreshTokenService.getRefreshToken(loginDTO.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken.getToken());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> body) {
        String tokenStr = body.get("refreshToken");
        RefreshToken refreshToken = refreshTokenService.findByToken(tokenStr);
        String newAccessToken = refreshTokenService.generateNewToken(refreshToken);

        Map<String, String> response = new HashMap<>();
        response.put("accessToken", newAccessToken);

        return ResponseEntity.ok(response);
    }
}