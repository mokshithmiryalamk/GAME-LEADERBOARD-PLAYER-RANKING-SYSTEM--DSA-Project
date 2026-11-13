package com.rankforge.controller;

import com.rankforge.dto.LeaderboardEntryResponse;
import com.rankforge.service.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST Controller for Ranked Leaderboard standings.
 * Executes genuine Java-powered QuickSort with Lomuto partitioning
 * directly derived from original `PlayerArray.java`.
 */
@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    public ResponseEntity<List<LeaderboardEntryResponse>> getLeaderboard(
            @RequestParam(value = "team", required = false) String team,
            @RequestParam(value = "limit", required = false, defaultValue = "0") int limit) {

        List<LeaderboardEntryResponse> standings = leaderboardService.getLeaderboard(team, limit);
        return ResponseEntity.ok(standings);
    }
}
