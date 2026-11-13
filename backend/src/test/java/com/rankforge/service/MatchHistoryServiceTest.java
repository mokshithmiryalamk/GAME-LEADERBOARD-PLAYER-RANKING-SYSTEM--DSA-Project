package com.rankforge.service;

import com.rankforge.dto.MatchResultDto;
import com.rankforge.dto.MatchUndoResultDto;
import com.rankforge.exception.PlayerConflictException;
import com.rankforge.model.Player;
import com.rankforge.repository.MatchRepository;
import com.rankforge.repository.PlayerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class MatchHistoryServiceTest {

    @Autowired
    private MatchHistoryService matchHistoryService;

    @Autowired
    private MatchService matchService;

    @Autowired
    private QueueService queueService;

    @Autowired
    private PlayerService playerService;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private MatchRepository matchRepository;

    @BeforeEach
    public void setup() {
        queueService.clearQueue();
    }

    @Test
    public void testSoloMatchUndoReversesScoreExactlyOnce() {
        queueService.joinQueue(101);
        queueService.joinQueue(102);

        Player p1Before = playerRepository.findById(101).orElseThrow();
        Player p2Before = playerRepository.findById(102).orElseThrow();
        int score1Initial = p1Before.getScore();
        int score2Initial = p2Before.getScore();

        MatchResultDto matchResult = matchService.playSoloMatch();
        int winnerId = matchResult.getParticipants().stream()
                .filter(p -> p.isWinner())
                .findFirst().orElseThrow().getPlayerId();

        Player winnerAfterMatch = playerRepository.findById(winnerId).orElseThrow();
        int expectedScoreAfterWin = (winnerId == 101 ? score1Initial : score2Initial) + 10;
        assertEquals(expectedScoreAfterWin, winnerAfterMatch.getScore());

        // Now execute LIFO undo!
        MatchUndoResultDto undoResult = matchHistoryService.undoLastMatch();

        assertNotNull(undoResult);
        assertEquals(matchResult.getMatchId(), undoResult.getMatchId());
        assertEquals(1, undoResult.getRevertedPlayers().size());
        assertEquals(10, undoResult.getRevertedPlayers().get(0).getPointsDeducted());

        // Solves Java Bug A: Winner's score returned PRECISELY to initial value (not -20!)
        Player winnerAfterUndo = playerRepository.findById(winnerId).orElseThrow();
        int expectedScoreAfterUndo = (winnerId == 101 ? score1Initial : score2Initial);
        assertEquals(expectedScoreAfterUndo, winnerAfterUndo.getScore());

        // Match record is marked UNDONE and preserved in audit log (not deleted!)
        MatchResultDto auditedMatch = matchHistoryService.getMatchById(matchResult.getMatchId());
        assertEquals("UNDONE", auditedMatch.getStatus());
        assertNotNull(auditedMatch.getUndoneAt());
    }

    @Test
    public void testTeamMatchUndoReversesBothWinningTeammatesAtomically() {
        queueService.joinQueue(101);
        queueService.joinQueue(102);
        queueService.joinQueue(103);
        queueService.joinQueue(104);

        MatchResultDto matchResult = matchService.playTeamMatch();

        // Execute LIFO undo
        MatchUndoResultDto undoResult = matchHistoryService.undoLastMatch();

        assertNotNull(undoResult);
        // Solves Java Bug B: Exactly 2 winning teammates were reverted simultaneously
        assertEquals(2, undoResult.getRevertedPlayers().size());
        for (var reverted : undoResult.getRevertedPlayers()) {
            assertEquals(10, reverted.getPointsDeducted());
        }
    }

    @Test
    public void testPlayerDeletionBlockedWhenPlayerWonActiveReversibleMatch() {
        queueService.joinQueue(101);
        queueService.joinQueue(102);

        MatchResultDto matchResult = matchService.playSoloMatch();
        int winnerId = matchResult.getParticipants().stream()
                .filter(p -> p.isWinner())
                .findFirst().orElseThrow().getPlayerId();

        // Attempting to delete the winning player of an active reversible match must throw 409 Conflict!
        PlayerConflictException ex = assertThrows(PlayerConflictException.class, () ->
                playerService.deletePlayer(winnerId)
        );
        assertTrue(ex.getMessage().contains("active match pending LIFO undo"));

        // Now undo the match
        matchHistoryService.undoLastMatch();
    }
}
