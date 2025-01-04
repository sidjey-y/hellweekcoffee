package com.hellweek.coffee.config;

import com.hellweek.coffee.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints - no authentication needed
                .requestMatchers(
                    "/auth/login",
                    "/auth/validate",
                    "/error",
                    "/auth/register"
                ).permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Admin only endpoints
                .requestMatchers(
                    "/auth/users/**",
                    "/api/analytics/**"
                ).hasAuthority("ROLE_ADMIN")
                
                // Manager and Admin endpoints - Write operations for items
                .requestMatchers(HttpMethod.POST, "/api/items/**", "/items/**").hasAnyAuthority("ROLE_MANAGER", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/items/**", "/items/**").hasAnyAuthority("ROLE_MANAGER", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/items/**", "/items/**").hasAnyAuthority("ROLE_MANAGER", "ROLE_ADMIN")
                
                // Read operations for items - accessible by Cashiers too
                .requestMatchers(HttpMethod.GET, "/api/items/**", "/items/**")
                .hasAnyAuthority("ROLE_CASHIER", "ROLE_MANAGER", "ROLE_ADMIN")
                
                // Categories management - Write operations
                .requestMatchers(HttpMethod.POST, "/api/categories/**", "/categories/**")
                .hasAnyAuthority("ROLE_MANAGER", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/categories/**", "/categories/**")
                .hasAnyAuthority("ROLE_MANAGER", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/categories/**", "/categories/**")
                .hasAnyAuthority("ROLE_MANAGER", "ROLE_ADMIN")
                
                // Categories management - Read operations
                .requestMatchers(HttpMethod.GET, "/api/categories/**", "/categories/**")
                .hasAnyAuthority("ROLE_CASHIER", "ROLE_MANAGER", "ROLE_ADMIN")
                
                // Manager and Admin endpoints
                .requestMatchers(
                    "/api/customers/search",
                    "/customers/search"
                ).hasAnyAuthority("ROLE_MANAGER", "ROLE_ADMIN")
                
                // Cashier endpoints
                .requestMatchers(
                    "/api/orders/**",
                    "/orders/**",
                    "/api/customers/search",
                    "/customers/search"
                ).hasAnyAuthority("ROLE_CASHIER", "ROLE_MANAGER", "ROLE_ADMIN")
                
                // Member registration (accessible by Manager and Cashier)
                .requestMatchers("/api/customers/register", "/customers/register")
                .hasAnyAuthority("ROLE_MANAGER", "ROLE_CASHIER", "ROLE_ADMIN")
                
                // Require authentication for all other endpoints
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:3001"
        )); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
