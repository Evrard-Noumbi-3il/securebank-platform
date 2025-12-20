package com.securebank.gateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.ReactiveRedisConnectionFactory;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import reactor.core.publisher.Mono;
import org.springframework.context.annotation.Primary;

import java.util.Objects;

@Slf4j
@Configuration
public class RedisConfig {

    /**
     * Key resolver for rate limiting based on IP address
     */
    @Bean
    @Primary
    public KeyResolver ipKeyResolver() {
        return exchange -> {
            String ip = Objects.requireNonNull(exchange.getRequest().getRemoteAddress())
                    .getAddress()
                    .getHostAddress();
            
            log.debug("Rate limit key resolver - IP: {}", ip);
            return Mono.just(ip);
        };
    }

    /**
     * Key resolver for rate limiting based on user ID (from JWT)
     */
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> {
            String userId = exchange.getRequest().getHeaders().getFirst("X-User-Id");
            
            if (userId == null || userId.isEmpty()) {
                // Fallback to IP if no user ID
                String ip = Objects.requireNonNull(exchange.getRequest().getRemoteAddress())
                        .getAddress()
                        .getHostAddress();
                return Mono.just(ip);
            }
            
            log.debug("Rate limit key resolver - User ID: {}", userId);
            return Mono.just(userId);
        };
    }

    /**
     * Reactive Redis Template configuration
     */
    @Bean
    public ReactiveRedisTemplate<String, String> reactiveRedisTemplate(
            ReactiveRedisConnectionFactory connectionFactory) {
        
        StringRedisSerializer serializer = new StringRedisSerializer();
        
        RedisSerializationContext<String, String> serializationContext = 
                RedisSerializationContext.<String, String>newSerializationContext()
                        .key(serializer)
                        .value(serializer)
                        .hashKey(serializer)
                        .hashValue(serializer)
                        .build();
        
        return new ReactiveRedisTemplate<>(connectionFactory, serializationContext);
    }
}