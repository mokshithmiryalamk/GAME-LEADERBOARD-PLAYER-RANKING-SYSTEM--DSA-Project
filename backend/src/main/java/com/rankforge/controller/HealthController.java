package com.rankforge.controller;

import com.rankforge.dto.HealthResponse;
import com.rankforge.service.MatchHistoryService;
import com.rankforge.service.PlayerService;
import com.rankforge.service.QueueService;
import com.rankforge.service.SeedDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;

/**
 * Health check endpoint for verifying backend operations and database telemetry.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final PlayerService playerService;
    private final SeedDataService seedDataService;
    private final QueueService queueService;
    private final MatchHistoryService matchHistoryService;
    private final DataSource dataSource;

    public HealthController(PlayerService playerService,
                            SeedDataService seedDataService,
                            QueueService queueService,
                            MatchHistoryService matchHistoryService,
                            @Autowired(required = false) DataSource dataSource) {
        this.playerService = playerService;
        this.seedDataService = seedDataService;
        this.queueService = queueService;
        this.matchHistoryService = matchHistoryService;
        this.dataSource = dataSource;
    }

    @GetMapping
    public ResponseEntity<HealthResponse> getHealth() {
        HealthResponse response = new HealthResponse(
                "UP",
                "RANKFORGE",
                "Player Rankings & Match Arena",
                "1.0.0-STAGE6",
                (int) playerService.getPlayerCount(),
                seedDataService.getQuarantinedCount(),
                queueService.getQueueSize(),
                matchHistoryService.getTotalMatches(),
                matchHistoryService.getActiveStackDepth(),
                resolveDatabaseEngine()
        );
        return ResponseEntity.ok(response);
    }

    private String resolveDatabaseEngine() {
        if (dataSource != null) {
            try (Connection conn = dataSource.getConnection()) {
                String product = conn.getMetaData().getDatabaseProductName();
                if ("PostgreSQL".equalsIgnoreCase(product)) {
                    return "Neon PostgreSQL (Serverless)";
                } else if ("H2".equalsIgnoreCase(product)) {
                    return "H2 Persistent (PostgreSQL Compatible)";
                } else if (product != null && !product.isBlank()) {
                    return product;
                }
            } catch (Exception ignored) {
            }
        }
        return "Relational Database (PostgreSQL Compatible)";
    }
}
