package com.meditrack.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@EnableWebSecurity
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource; // injecté depuis CorsConfig

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // ── CORS ── branché sur CorsConfig (autorise localhost:5173)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Endpoints publics
                        .requestMatchers("/login", "/refresh-token").permitAll()
                        // Auto-inscription patient
                        .requestMatchers(HttpMethod.POST, "/patients").permitAll()
                        // Hôpitaux : ADMIN
                        .requestMatchers("/hopital/**").hasRole("ADMIN")
                        // Médecins : ADMIN pour créer/supprimer
                        .requestMatchers(HttpMethod.POST, "/medecins").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/medecins/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/medecins/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/medecins/**").hasAnyRole("ADMIN", "MEDECIN")
                        // Patients
                        .requestMatchers(HttpMethod.GET, "/patients/**").hasAnyRole("ADMIN", "SECRETAIRE", "MEDECIN")
                        .requestMatchers(HttpMethod.PUT, "/patients/**").hasAnyRole("ADMIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.DELETE, "/patients/**").hasRole("ADMIN")
                        // Rendez-vous
                        .requestMatchers(HttpMethod.POST, "/rendez-vous").hasAnyRole("PATIENT", "SECRETAIRE", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/rendez-vous/**").hasAnyRole("ADMIN", "MEDECIN", "SECRETAIRE", "PATIENT")
                        .requestMatchers("/rendez-vous/*/confirmer", "/rendez-vous/*/annuler").hasAnyRole("SECRETAIRE", "ADMIN")
                        .requestMatchers("/rendez-vous/*/terminer").hasRole("MEDECIN")
                        // Dossiers médicaux
                        .requestMatchers("/dossiers-medicaux/**").hasAnyRole("MEDECIN", "ADMIN", "SECRETAIRE", "PATIENT")
                        // Ordonnances
                        .requestMatchers(HttpMethod.POST, "/ordonnances").hasRole("MEDECIN")
                        .requestMatchers(HttpMethod.GET, "/ordonnances/**").hasAnyRole("MEDECIN", "PATIENT", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/ordonnances/**").hasRole("ADMIN")
                        // Secrétaires
                        .requestMatchers(HttpMethod.POST, "/secretaires").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/secretaires/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/secretaires/**").hasAnyRole("ADMIN")
                        // Utilisateurs
                        .requestMatchers("/utilisateurs/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}