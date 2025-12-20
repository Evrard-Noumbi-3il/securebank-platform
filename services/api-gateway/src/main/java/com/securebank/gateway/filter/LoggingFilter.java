package com.securebank.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // Log incoming request
        String timestamp = LocalDateTime.now().format(FORMATTER);
        String method = request.getMethod().toString();
        String path = request.getPath().toString();
        String clientIp = getClientIp(request);

        log.info("[{}] Incoming Request: {} {} from {}", timestamp, method, path, clientIp);

        // Continue with the filter chain and log response
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            ServerHttpResponse response = exchange.getResponse();
            int statusCode = response.getStatusCode() != null ? response.getStatusCode().value() : 0;
            
            log.info("[{}] Response: {} {} - Status: {}", 
                    LocalDateTime.now().format(FORMATTER), method, path, statusCode);
        }));
    }

    /**
     * Get client IP address from request
     */
    private String getClientIp(ServerHttpRequest request) {
        String ip = request.getHeaders().getFirst("X-Forwarded-For");
        
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeaders().getFirst("Proxy-Client-IP");
        }
        
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeaders().getFirst("WL-Proxy-Client-IP");
        }
        
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddress() != null ? 
                  request.getRemoteAddress().getAddress().getHostAddress() : "unknown";
        }
        
        // If multiple IPs, take the first one
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        
        return ip;
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE; // Execute last
    }
}