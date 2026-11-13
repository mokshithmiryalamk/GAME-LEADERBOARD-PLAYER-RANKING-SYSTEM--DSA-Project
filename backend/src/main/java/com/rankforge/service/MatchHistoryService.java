package com.rankforge.service;

import com.rankforge.dto.MatchResultDto;
import com.rankforge.dto.MatchUndoResultDto;
import com.rankforge.dto.ParticipantResultDto;
import com.rankforge.dto.RevertedPlayerDto;
import com.rankforge.dto.TieRerollDto;
import com.rankforge.exception.NoEligibleMatchException;
import com.rankforge.exception.PlayerNotFoundException;
import com.rankforge.model.Match;
import com.rankforge.model.MatchParticipant;
import com.rankforge.model.MatchTieReroll;
import com.rankforge.model.Player;
import com.rankforge.repository.MatchParticipantRepository;
import com.rankforge.repository.MatchRepository;
import com.rankforge.repository.PlayerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Service managing durable match history auditing and atomic LIFO undo operations.
 * Directly adapts and solves flaws in original-source/MatchHistoryStack.java and Main.java.
 *
 * Flaws Resolved:
 * 1. Double Deduction: Original code decremented 10 points in MatchHistoryStack.pop() AND
 *    another 10 points in Main.java case 9 (-20 points total). This service decrements exactly
 *    10 points once per winner.
 * 2. Asymmetric 2v2 Undo: Original code pushed winners separately and only popped one winner.
 *    This service reverses the whole team match atomically.
 * 3. Negative Score Clamping: Eliminates Math.max(0, ...) clamping to maintain full audit integrity.
 * 4. Audit History Preservation: Matches are marked 'UNDONE' with timestamps rather than deleted.
 */
@Service
public class MatchHistoryService {

    private static final Logger log = LoggerFactory.getLogger(MatchHistoryService.class);

    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;

    public MatchHistoryService(MatchRepository matchRepository, PlayerRepository playerRepository) {
        this.matchRepository = matchRepository;
        this.playerRepository = playerRepository;
    }

    /**
     * Retrieves all match history in true LIFO reverse chronological order (newest first).
     */
    @Transactional(readOnly = true)
    public List<MatchResultDto> getHistory(String statusFilter, int limit) {
        List<Match> matches;
        if (statusFilter != null && !statusFilter.isBlank() && !"all".equalsIgnoreCase(statusFilter)) {
            matches = matchRepository.findByStatusOrderByPlayedAtDesc(statusFilter.trim().toUpperCase());
        } else {
            matches = matchRepository.findAllByOrderByPlayedAtDesc();
        }

        int max = (limit > 0 && limit < matches.size()) ? limit : matches.size();
        List<MatchResultDto> dtos = new ArrayList<>(max);
        for (int i = 0; i < max; i++) {
            dtos.add(toResultDto(matches.get(i)));
        }

        return dtos;
    }

    @Transactional(readOnly = true)
    public MatchResultDto getMatchById(Long id) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Match #" + id + " not found."));
        return toResultDto(match);
    }

    /**
     * Executes atomic LIFO undo on the topmost eligible completed match.
     */
    @Transactional
    public synchronized MatchUndoResultDto undoLastMatch() {
        List<Match> eligibleMatches = matchRepository.findCompletedMatchesForUndo();
        if (eligibleMatches.isEmpty()) {
            throw new NoEligibleMatchException("No eligible completed matches available in history stack to undo.");
        }

        Match topMatch = eligibleMatches.get(0);
        log.info("Executing LIFO undo for Match #{} (Type: {}, PlayedAt: {})",
                topMatch.getId(), topMatch.getMatchType(), topMatch.getPlayedAt());

        // Attempt atomic database update to mark match UNDONE.
        // Concurrency guard: if another transaction already marked it UNDONE, updatedRows is 0.
        Instant now = Instant.now();
        int updatedRows = matchRepository.markMatchUndone(topMatch.getId(), now);
        if (updatedRows == 0) {
            throw new NoEligibleMatchException("Match #" + topMatch.getId() + " has already been undone by another concurrent transaction.");
        }
        topMatch.setStatus("UNDONE");
        topMatch.setUndoneAt(now);

        List<RevertedPlayerDto> reverted = new ArrayList<>();

        // Revert exactly one score award per winning participant
        for (MatchParticipant mp : topMatch.getParticipants()) {
            if (mp.isWinner()) {
                Player winner = playerRepository.findById(mp.getPlayer().getId())
                        .orElseThrow(() -> new PlayerNotFoundException(mp.getPlayer().getId()));

                int pointsToRevert = mp.getScoreDelta(); // Exactly 10
                winner.decrementScore(pointsToRevert);
                playerRepository.save(winner);

                reverted.add(new RevertedPlayerDto(
                        winner.getId(),
                        winner.getName(),
                        pointsToRevert,
                        winner.getScore()
                ));

                log.info("Reverted {} points from winner #{} ({}). New score: {}",
                        pointsToRevert, winner.getId(), winner.getName(), winner.getScore());
            }
        }

        String message = String.format("Match #%d (%s) undone successfully. Rating points reverted for %d winning participant(s).",
                topMatch.getId(), topMatch.getMatchType(), reverted.size());

        return new MatchUndoResultDto(
                topMatch.getId(),
                topMatch.getMatchType(),
                topMatch.getPlayedAt(),
                topMatch.getUndoneAt(),
                message,
                reverted
        );
    }

    public long getActiveStackDepth() {
        return matchRepository.countByStatus("COMPLETED");
    }

    public long getTotalMatches() {
        return matchRepository.count();
    }

    private MatchResultDto toResultDto(Match match) {
        List<ParticipantResultDto> partDtos = new ArrayList<>();
        for (MatchParticipant mp : match.getParticipants()) {
            partDtos.add(new ParticipantResultDto(
                    mp.getPlayer().getId(),
                    mp.getPlayerName(),
                    mp.getPlayerTeam(),
                    mp.getPlayerLevel(),
                    mp.getSide(),
                    mp.getDiceRoll(),
                    mp.isWinner(),
                    mp.getScoreDelta(),
                    mp.getPlayer().getScore()
            ));
        }

        List<TieRerollDto> tieDtos = new ArrayList<>();
        if (match.getTieRerolls() != null) {
            for (MatchTieReroll tr : match.getTieRerolls()) {
                tieDtos.add(new TieRerollDto(tr.getRoundNumber(), tr.getSideAlphaRoll(), tr.getSideOmegaRoll()));
            }
        }

        return new MatchResultDto(
                match.getId(),
                match.getMatchType(),
                match.getStatus(),
                match.getWinningSide(),
                match.getScoreAward(),
                match.getSummary(),
                match.getPlayedAt(),
                match.getUndoneAt(),
                partDtos,
                tieDtos
        );
    }
}
