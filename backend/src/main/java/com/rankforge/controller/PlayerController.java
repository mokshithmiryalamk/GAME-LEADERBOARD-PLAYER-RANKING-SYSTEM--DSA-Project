package com.rankforge.controller;

import com.rankforge.model.Player;
import com.rankforge.service.PlayerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Player Registry operations.
 * Exposes endpoints:
 * - GET /api/players: returns all valid player records
 * - GET /api/players/{id}: returns player by unique ID
 * - GET /api/players/search: multi-criteria linear search (query, name, team)
 * - POST /api/players: registers a new contender
 * - PUT /api/players/{id}: updates mutable contender attributes (score is protected)
 * - DELETE /api/players/{id}: removes a player from registry (guarded against active undo conflicts)
 * - POST /api/players/reset: restores original 53 seed records and clears dependent match/queue data
 */
@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;

    @org.springframework.beans.factory.annotation.Value("${rankforge.demo.reset-enabled:true}")
    private boolean resetEnabled;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public ResponseEntity<List<Player>> getAllPlayers() {
        return ResponseEntity.ok(playerService.getAllPlayers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Player> getPlayerById(@PathVariable("id") int id) {
        return ResponseEntity.ok(playerService.getPlayerById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Player>> searchPlayers(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "team", required = false) String team) {
        return ResponseEntity.ok(playerService.search(query, name, team));
    }

    @PostMapping
    public ResponseEntity<Player> registerPlayer(@RequestBody Player player) {
        Player created = playerService.createPlayer(player);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Player> updatePlayer(
            @PathVariable("id") int id,
            @RequestBody Player updateData) {
        Player updated = playerService.updatePlayer(id, updateData);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deletePlayer(@PathVariable("id") int id) {
        playerService.deletePlayer(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "deletedId", id,
                "message", "Player #" + id + " was successfully removed from the RANKFORGE registry."
        ));
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetToSeed() {
        if (!resetEnabled) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "Roster reset is restricted in this environment."
            ));
        }
        playerService.resetDemoData();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "RANKFORGE roster restored to authentic seed data.",
                "totalPlayers", playerService.getPlayerCount()
        ));
    }
}
