package com.rankforge.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;

/**
 * Global CORS configuration enabling the browser frontend (React on Vercel)
 * to communicate seamlessly with the Spring Boot REST API.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://localhost:4173,http://localhost:8080,http://127.0.0.1:5173,http://127.0.0.1:4173,http://127.0.0.1:3000,http://127.0.0.1:8080,http://127.0.0.1:5500,https://rankforge-dsa.vercel.app}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> patterns = new ArrayList<>();
        if (allowedOrigins != null && !allowedOrigins.isBlank()) {
            for (String origin : allowedOrigins.split(",")) {
                String trimmed = origin.trim();
                if (!trimmed.isEmpty()) {
                    patterns.add(trimmed);
                }
            }
        }
        // Always preserve local development origins
        if (!patterns.contains("http://localhost:*")) patterns.add("http://localhost:*");
        if (!patterns.contains("http://127.0.0.1:*")) patterns.add("http://127.0.0.1:*");

        registry.addMapping("/**")
                .allowedOriginPatterns(patterns.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
