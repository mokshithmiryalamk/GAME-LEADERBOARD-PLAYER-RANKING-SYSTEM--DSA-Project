package com.rankforge.controller;

import com.rankforge.dto.HealthResponse;
import com.rankforge.service.MatchHistoryService;
import com.rankforge.service.PlayerService;
import com.rankforge.service.QueueService;
import com.rankforge.service.SeedDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Health check endpoint for verifying backend operations and Stage 6 persistent database metrics.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final PlayerService playerService;
    private final SeedDataService seedDataService;
    private final QueueService queueService;
    private final MatchHistoryService matchHistoryService;

    public HealthController(PlayerService playerService,
                            SeedDataService seedDataService,
                            QueueService queueService,
                            MatchHistoryService matchHistoryService) {
        this.playerService = playerService;
        this.seedDataService = seedDataService;
        this.queueService = queueService;
        this.matchHistoryService = matchHistoryService;
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
                "H2 Persistent (PostgreSQL Compatible)"
        );
        return ResponseEntity.ok(response);
    }
}
