package com.rankforge.controller;

import com.rankforge.dto.JoinQueueRequest;
import com.rankforge.dto.QueueEntryResponse;
import com.rankforge.service.QueueService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Circular Matchmaking Queue operations.
 * Exposes endpoints:
 * - GET /api/queue: retrieves waiting contenders in FIFO order with positions and circular slot indices
 * - POST /api/queue: joins lobby (accepts JSON { "playerId": 104 } or ?playerId=104)
 * - POST /api/queue/{playerId}: joins lobby with path variable
 * - DELETE /api/queue/{playerId}: leaves lobby
 * - POST /api/queue/clear: clears lobby
 */
@RestController
@RequestMapping("/api/queue")
public class QueueController {

    private final QueueService queueService;

    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    @GetMapping
    public ResponseEntity<List<QueueEntryResponse>> getQueue() {
        return ResponseEntity.ok(queueService.getQueue());
    }

    @PostMapping
    public ResponseEntity<QueueEntryResponse> joinQueue(
            @RequestBody(required = false) JoinQueueRequest request,
            @RequestParam(value = "playerId", required = false) Integer playerIdParam) {

        Integer targetId = (request != null && request.getPlayerId() != null)
                ? request.getPlayerId()
                : playerIdParam;

        if (targetId == null) {
            throw new IllegalArgumentException("Player ID must be provided in request body or as a query parameter.");
        }

        QueueEntryResponse entry = queueService.joinQueue(targetId);
        return ResponseEntity.status(HttpStatus.CREATED).body(entry);
    }

    @PostMapping("/{playerId}")
    public ResponseEntity<QueueEntryResponse> joinQueueByPath(@PathVariable("playerId") int playerId) {
        QueueEntryResponse entry = queueService.joinQueue(playerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(entry);
    }

    @DeleteMapping("/{playerId}")
    public ResponseEntity<Map<String, Object>> leaveQueue(@PathVariable("playerId") int playerId) {
        queueService.leaveQueue(playerId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Player #" + playerId + " successfully left the matchmaking lobby.",
                "remainingQueueSize", queueService.getQueueSize()
        ));
    }

    @PostMapping("/clear")
    public ResponseEntity<Map<String, Object>> clearQueue() {
        queueService.clearQueue();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Matchmaking lobby cleared successfully."
        ));
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> clearQueueDelete() {
        queueService.clearQueue();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Matchmaking lobby cleared successfully."
        ));
    }
}
