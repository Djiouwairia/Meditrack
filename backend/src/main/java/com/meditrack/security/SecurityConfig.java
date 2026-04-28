package com.meditrack.security;

import com.meditrack.security.JwtAuthFilter;
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
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ── Public ──
                        .requestMatchers("/login", "/refresh-token").permitAll()
                        .requestMatchers(HttpMethod.POST, "/patients").permitAll()

                        // ── Hôpitaux ──
                        .requestMatchers("/hopital/**").hasRole("ADMIN")

                        // ── Médecins ──
                        .requestMatchers(HttpMethod.POST,   "/medecins").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/medecins/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/medecins/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH,  "/medecins/**").hasAnyRole("ADMIN", "MEDECIN")

                        // ── Disponibilités (NOUVEAU) ──
                        .requestMatchers(HttpMethod.POST,   "/disponibilites").hasRole("MEDECIN")
                        .requestMatchers(HttpMethod.DELETE, "/disponibilites/**").hasRole("MEDECIN")
                        .requestMatchers(HttpMethod.PATCH,  "/disponibilites/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/disponibilites/**").hasAnyRole("MEDECIN", "SECRETAIRE", "ADMIN")

                        // ── Patients ──
                        .requestMatchers(HttpMethod.GET,    "/patients/**").hasAnyRole("ADMIN", "SECRETAIRE", "MEDECIN")
                        .requestMatchers(HttpMethod.PUT,    "/patients/**").hasAnyRole("ADMIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.DELETE, "/patients/**").hasRole("ADMIN")

                        // ── Rendez-vous ──
                        .requestMatchers(HttpMethod.POST, "/rendez-vous").hasAnyRole("PATIENT", "SECRETAIRE", "ADMIN")
                        .requestMatchers(HttpMethod.GET,  "/rendez-vous/**").hasAnyRole("ADMIN", "MEDECIN", "SECRETAIRE", "PATIENT")
                        .requestMatchers("/rendez-vous/*/confirmer", "/rendez-vous/*/annuler").hasAnyRole("SECRETAIRE", "ADMIN")
                        .requestMatchers("/rendez-vous/*/terminer").hasRole("MEDECIN")

                        // ── Dossiers ──
                        .requestMatchers("/dossiers-medicaux/**").hasAnyRole("MEDECIN", "ADMIN", "SECRETAIRE", "PATIENT")

                        // ── Ordonnances ──
                        .requestMatchers(HttpMethod.POST,   "/ordonnances").hasRole("MEDECIN")
                        .requestMatchers(HttpMethod.GET,    "/ordonnances/**").hasAnyRole("MEDECIN", "PATIENT", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/ordonnances/**").hasRole("ADMIN")

                        // ── Secrétaires ──
                        .requestMatchers(HttpMethod.POST,   "/secretaires").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/secretaires/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/secretaires/**").hasAnyRole("ADMIN")

                        // ── Utilisateurs ──
                        .requestMatchers("/utilisateurs/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}