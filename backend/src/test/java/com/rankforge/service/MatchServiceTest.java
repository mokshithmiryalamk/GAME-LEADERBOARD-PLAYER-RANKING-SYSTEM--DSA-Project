package com.rankforge.service;

import com.rankforge.dto.MatchResultDto;
import com.rankforge.exception.InsufficientQueuePlayersException;
import com.rankforge.model.Player;
import com.rankforge.repository.MatchRepository;
import com.rankforge.repository.PlayerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class MatchServiceTest {

    @Autowired
    private MatchService matchService;

    @Autowired
    private QueueService queueService;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private MatchRepository matchRepository;

    @BeforeEach
    public void setup() {
        queueService.clearQueue();
    }

    @Test
    public void testSoloMatchThrowsWhenInsufficientPlayers() {
        assertThrows(InsufficientQueuePlayersException.class, () -> matchService.playSoloMatch());

        queueService.joinQueue(101);
        assertThrows(InsufficientQueuePlayersException.class, () -> matchService.playSoloMatch());
    }

    @Test
    public void testSoloMatchPlaysAndAwardsScoreAndConsumesQueue() {
        // Prepare 2 players in queue: 101 (Rahul) and 102 (Rohan)
        queueService.joinQueue(101);
        queueService.joinQueue(102);
        assertEquals(2, queueService.getQueueSize());

        Player p1Before = playerRepository.findById(101).orElseThrow();
        Player p2Before = playerRepository.findById(102).orElseThrow();
        int score1Before = p1Before.getScore();
        int score2Before = p2Before.getScore();

        MatchResultDto result = matchService.playSoloMatch();

        assertNotNull(result);
        assertEquals("1v1", result.getMatchType());
        assertEquals("COMPLETED", result.getStatus());
        assertEquals(2, result.getParticipants().size());
        assertEquals(0, queueService.getQueueSize()); // Queue consumed!

        // Winner got +10 points
        Player p1After = playerRepository.findById(101).orElseThrow();
        Player p2After = playerRepository.findById(102).orElseThrow();

        if ("ALPHA".equals(result.getWinningSide())) {
            assertEquals(score1Before + 10, p1After.getScore());
            assertEquals(score2Before, p2After.getScore());
        } else {
            assertEquals(score1Before, p1After.getScore());
            assertEquals(score2Before + 10, p2After.getScore());
        }
    }

    @Test
    public void testTeamMatchThrowsWhenLessThanFourPlayers() {
        queueService.joinQueue(101);
        queueService.joinQueue(102);
        queueService.joinQueue(103);
        assertEquals(3, queueService.getQueueSize());

        assertThrows(InsufficientQueuePlayersException.class, () -> matchService.playTeamMatch());
    }

    @Test
    public void testTeamMatchPlaysAndAwardsScoreToBothWinningTeammates() {
        queueService.joinQueue(101);
        queueService.joinQueue(102);
        queueService.joinQueue(103);
        queueService.joinQueue(104);
        assertEquals(4, queueService.getQueueSize());

        MatchResultDto result = matchService.playTeamMatch();

        assertNotNull(result);
        assertEquals("2v2", result.getMatchType());
        assertEquals("COMPLETED", result.getStatus());
        assertEquals(4, result.getParticipants().size());
        assertEquals(0, queueService.getQueueSize()); // All 4 consumed!

        // Check 2 winners got +10 each
        long winnerCount = result.getParticipants().stream().filter(p -> p.isWinner()).count();
        assertEquals(2, winnerCount);

        long winnersWithPlus10 = result.getParticipants().stream()
                .filter(p -> p.isWinner() && p.getScoreDelta() == 10)
                .count();
        assertEquals(2, winnersWithPlus10);
    }
}
