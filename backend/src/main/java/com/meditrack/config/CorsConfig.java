package com.meditrack.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Origine du frontend React (Vite)
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",   // Vite dev
                "http://localhost:3000"    // CRA dev (au cas où)
        ));

        // Méthodes HTTP autorisées
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Headers autorisés (Authorization pour JWT + Content-Type)
        config.setAllowedHeaders(List.of("*"));

        // Autoriser l'envoi des cookies / Authorization header
        config.setAllowCredentials(true);

        // Durée de cache du preflight OPTIONS (en secondes)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}