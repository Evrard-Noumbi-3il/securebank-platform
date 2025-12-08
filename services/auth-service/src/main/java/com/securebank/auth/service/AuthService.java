package com.securebank.auth.service;

import com.securebank.auth.dto.*;
import com.securebank.auth.exception.UserAlreadyExistsException;
import com.securebank.auth.model.Role;
import com.securebank.auth.model.User;
import com.securebank.auth.repository.RoleRepository;
import com.securebank.auth.repository.UserRepository;
import com.securebank.auth.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    /* -------------------------------------
     * REGISTER
     * ------------------------------------- */
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        log.info("[REGISTER] Tentative d'inscription pour: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("[REGISTER] Email déjà utilisé: {}", request.getEmail());
            throw new UserAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .enabled(true)
                .accountNonLocked(true)
                .failedLoginAttempts(0)
                .build();

        Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER)
                .orElseGet(() -> {
                    log.info("[REGISTER] Rôle ROLE_USER manquant. Création...");
                    return roleRepository.save(Role.builder()
                            .name(Role.RoleName.ROLE_USER)
                            .build());
                });

        user.setRoles(Set.of(userRole));
        user = userRepository.save(user);

        log.info("[REGISTER] Compte créé avec succès: {}", user.getEmail());

        String accessToken = jwtUtils.generateAccessToken(user.getEmail());
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        log.debug("[REGISTER] Tokens générés pour {}", user.getEmail());

        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .roles(user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .toList())
                .build();
    }

    /* -------------------------------------
     * LOGIN
     * ------------------------------------- */
    public AuthResponse login(LoginRequest request) {

        log.info("[LOGIN] Tentative de connexion pour: {}", request.getEmail());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> {
                        log.warn("[LOGIN] Utilisateur introuvable: {}", request.getEmail());
                        return new RuntimeException("User not found");
                    });

            // Réinitialisation des tentatives
            if (user.getFailedLoginAttempts() > 0) {
                log.info("[LOGIN] Réinitialisation des tentatives échouées pour {}", request.getEmail());
                user.setFailedLoginAttempts(0);
                userRepository.save(user);
            }

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .toList();

            log.info("[LOGIN] Authentification réussie pour {}", request.getEmail());

            String accessToken = jwtUtils.generateAccessToken(authentication);
            String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

            log.debug("[LOGIN] Tokens générés pour {}", request.getEmail());

            return AuthResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .roles(roles)
                    .build();

        } catch (Exception e) {

            log.warn("[LOGIN] Échec de connexion pour {} — raison: {}", request.getEmail(), e.getMessage());

            // Incrémenter les tentatives échouées
            userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
                user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);

                // Si trop d’échecs → lock
                if (user.getFailedLoginAttempts() >= 5) {
                    user.setAccountNonLocked(false);
                    log.warn("[LOGIN] Compte verrouillé pour {}", user.getEmail());
                }

                userRepository.save(user);
            });

            throw e;
        }
    }

    /* -------------------------------------
     * REFRESH TOKEN
     * ------------------------------------- */
    public AuthResponse refreshToken(RefreshTokenRequest request) {

        log.info("[REFRESH] Demande d'un nouveau access token");

        String refreshToken = request.getRefreshToken();

        if (!jwtUtils.validateJwtToken(refreshToken)) {
            log.warn("[REFRESH] Refresh token invalide");
            throw new RuntimeException("Invalid refresh token");
        }

        String email = jwtUtils.getEmailFromJwt(refreshToken);

        log.info("[REFRESH] Refresh token valide pour {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newAccessToken = jwtUtils.generateAccessToken(email);

        log.debug("[REFRESH] Nouveau access token généré pour {}", email);

        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .roles(user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .toList())
                .build();
    }
}
