package com.securebank.account.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;

import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
@EnableCaching
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String redisHost;

    @Value("${spring.data.redis.port}")
    private int redisPort;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    @Value("${cache.ttl:300}")
    private long cacheTtl;

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration configuration = new RedisStandaloneConfiguration(redisHost, redisPort);
        if (!redisPassword.isEmpty()) {
            configuration.setPassword(redisPassword);
        }
        return new LettuceConnectionFactory(configuration);
    }

    @Bean
    public RedisCacheManager cacheManager(
            RedisConnectionFactory connectionFactory, 
            ObjectMapper objectMapper) { // <--- INJECTION DU BEAN ObjectMapper

            // Utiliser le GenericJackson2JsonRedisSerializer pour envelopper 
            // l'ObjectMapper configuré.
            GenericJackson2JsonRedisSerializer jacksonSerializer = 
                new GenericJackson2JsonRedisSerializer(objectMapper); // <--- UTILISATION

            RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofSeconds(cacheTtl))
                    .serializeValuesWith(
                            RedisSerializationContext.SerializationPair.fromSerializer(
                                    jacksonSerializer // <--- Référence au sérialiseur basé sur le Bean
                            )
                    );

            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(config)
                    .build();
        }
}