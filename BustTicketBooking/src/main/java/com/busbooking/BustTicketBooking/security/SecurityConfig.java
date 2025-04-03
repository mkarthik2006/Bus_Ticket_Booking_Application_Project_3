package com.busbooking.BustTicketBooking.security;

import com.busbooking.BustTicketBooking.serviceImpl.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(tokenProvider, customUserDetailsService);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for stateless JWT-based authentication
                .csrf(csrf -> csrf.disable())
                // Enable CORS using our configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Use stateless session management
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Configure URL authorization
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/users/register",
                                "/users/login",
                                "/api/users/register",
                                "/api/users/login",
                                "/api/buses/search",
                                "/api/bookings/**",
                                "/api/buses/**",
                                "/api/cities",
                                "/api/admin/cities",
                                "/api/download/bookings/**",
                                "/api/payments/**",
                                "/api/view/**",
                                "/css/**",
                                "/js/**",
                                "/favicon.ico",
                                "/index.html",
                                "/",
                                "/login",
                                "/register",
                                "/booking",
                                "/payment"
                        ).permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                // Set exception handling to use our custom entry point
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler));

        // Add JWT authentication filter before UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CORS configuration to allow requests from your frontend (http://localhost:3000)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type", "Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
