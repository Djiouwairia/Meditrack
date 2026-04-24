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

@EnableWebSecurity
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Endpoints publics
                        .requestMatchers("/login", "/refresh-token").permitAll()
                        // Gestion des hôpitaux : ADMIN uniquement
                        .requestMatchers("/hopital/**").hasRole("ADMIN")
                        // Gestion des médecins : ADMIN
                        .requestMatchers(HttpMethod.POST, "/medecins").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/medecins/**").hasRole("ADMIN")
                        // Consultation médecins : tous les rôles authentifiés
                        .requestMatchers(HttpMethod.GET, "/medecins/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/medecins/**").hasAnyRole("ADMIN", "MEDECIN")
                        // Gestion des patients : ADMIN, SECRETAIRE
                        .requestMatchers(HttpMethod.POST, "/patients").hasAnyRole("ADMIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.GET, "/patients/**").hasAnyRole("ADMIN", "SECRETAIRE", "MEDECIN")
                        .requestMatchers(HttpMethod.PUT, "/patients/**").hasAnyRole("ADMIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.DELETE, "/patients/**").hasRole("ADMIN")
                        // Rendez-vous : patient peut prendre rdv, secrétaire gère, médecin consulte/termine
                        .requestMatchers(HttpMethod.POST, "/rendez-vous").hasAnyRole("PATIENT", "SECRETAIRE", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/rendez-vous/**").hasAnyRole("ADMIN", "MEDECIN", "SECRETAIRE", "PATIENT")
                        .requestMatchers("/rendez-vous/*/confirmer", "/rendez-vous/*/annuler").hasAnyRole("SECRETAIRE", "ADMIN")
                        .requestMatchers("/rendez-vous/*/terminer").hasRole("MEDECIN")
                        // Dossiers médicaux : médecin et patient (le sien)
                        .requestMatchers("/dossiers-medicaux/**").hasAnyRole("MEDECIN", "ADMIN", "SECRETAIRE", "PATIENT")
                        // Ordonnances : médecin prescrit, patient consulte
                        .requestMatchers(HttpMethod.POST, "/ordonnances").hasRole("MEDECIN")
                        .requestMatchers(HttpMethod.GET, "/ordonnances/**").hasAnyRole("MEDECIN", "PATIENT", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/ordonnances/**").hasRole("ADMIN")
                        // Gestion secrétaires : ADMIN
                        .requestMatchers(HttpMethod.POST, "/secretaires").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/secretaires/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/secretaires/**").hasAnyRole("ADMIN")
                        // Utilisateurs génériques : ADMIN
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