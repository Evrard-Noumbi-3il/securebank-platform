package com.securebank.account.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    /**
     * Définit l'ObjectMapper principal utilisé par Spring pour la sérialisation JSON.
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        
        // C'est la ligne CRITIQUE qui résout l'erreur.
        // Elle enregistre le module permettant de sérialiser les types Java 8 (LocalDateTime).
        objectMapper.registerModule(new JavaTimeModule());
        
        // Recommandé : S'assure que les dates sont sérialisées en chaînes de caractères (ex: "2025-12-10T20:07:01")
        // et non en nombres (timestamps).
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        return objectMapper;
    }
}