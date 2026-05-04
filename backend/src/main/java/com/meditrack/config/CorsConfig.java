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

        // Accepte toutes les origines (réseau local, téléphone, autre machine)
        // Pour restreindre en production, remplacer par les domaines exacts.
        config.setAllowedOriginPatterns(List.of("*"));

        // Méthodes HTTP autorisées
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Tous les headers (Authorization JWT + Content-Type + custom)
        config.setAllowedHeaders(List.of("*"));

        // Nécessaire pour envoyer le header Authorization
        config.setAllowCredentials(true);

        // Cache preflight OPTIONS 1 heure
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}