package com.rankforge.controller;

import com.rankforge.dto.MatchResultDto;
import com.rankforge.dto.MatchUndoResultDto;
import com.rankforge.dto.PlayMatchRequest;
import com.rankforge.service.MatchHistoryService;
import com.rankforge.service.MatchService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Esports Combat Matches and LIFO History Stack.
 * Exposes endpoints:
 * - POST /api/matches/play: initiates a match (type=1v1 or 2v2)
 * - POST /api/matches/solo: alias for 1v1 match
 * - POST /api/matches/team: alias for 2v2 match
 * - GET /api/matches: retrieves match history in LIFO order
 * - GET /api/matches/{id}: retrieves specific match details
 * - POST /api/matches/undo: atomic LIFO undo reversing the latest eligible match
 */
@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService matchService;
    private final MatchHistoryService matchHistoryService;

    public MatchController(MatchService matchService, MatchHistoryService matchHistoryService) {
        this.matchService = matchService;
        this.matchHistoryService = matchHistoryService;
    }

    @PostMapping("/play")
    public ResponseEntity<MatchResultDto> playMatch(
            @RequestBody(required = false) PlayMatchRequest request,
            @RequestParam(value = "type", required = false) String typeParam) {

        String matchType = (request != null && request.getMatchType() != null)
                ? request.getMatchType()
                : (typeParam != null ? typeParam : "1v1");

        MatchResultDto result;
        if ("2v2".equalsIgnoreCase(matchType) || "team".equalsIgnoreCase(matchType)) {
            result = matchService.playTeamMatch();
        } else {
            result = matchService.playSoloMatch();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/solo")
    public ResponseEntity<MatchResultDto> playSoloMatch() {
        MatchResultDto result = matchService.playSoloMatch();
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/team")
    public ResponseEntity<MatchResultDto> playTeamMatch() {
        MatchResultDto result = matchService.playTeamMatch();
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping
    public ResponseEntity<List<MatchResultDto>> getMatchHistory(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "limit", required = false, defaultValue = "0") int limit) {
        return ResponseEntity.ok(matchHistoryService.getHistory(status, limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchResultDto> getMatchById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(matchHistoryService.getMatchById(id));
    }

    @PostMapping("/undo")
    public ResponseEntity<MatchUndoResultDto> undoLastMatch() {
        MatchUndoResultDto result = matchHistoryService.undoLastMatch();
        return ResponseEntity.ok(result);
    }
}
