package com.securebank.auth.controller;

import com.securebank.auth.dto.AuthResponse;
import com.securebank.auth.dto.LoginRequest;
import com.securebank.auth.dto.RefreshTokenRequest;
import com.securebank.auth.dto.RegisterRequest;
import com.securebank.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and Registration APIs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Create a new user account")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate user and return JWT tokens")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {

        log.info("Tentative de login pour l’utilisateur: {}", request.getEmail());

        try {
            AuthResponse response = authService.login(request);
            log.info("Login réussi pour: {}", request.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.warn("Échec de login pour: {} — Raison: {}", request.getEmail(), e.getMessage());
            throw e; // permet à Spring de renvoyer une erreur HTTP appropriée
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Generate new access token using refresh token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Logout user (client-side token removal)")
    public ResponseEntity<String> logout() {

        log.info("Déconnexion demandée par l’utilisateur (client-side token removal)");

        return ResponseEntity.ok("Logged out successfully");
    }
}