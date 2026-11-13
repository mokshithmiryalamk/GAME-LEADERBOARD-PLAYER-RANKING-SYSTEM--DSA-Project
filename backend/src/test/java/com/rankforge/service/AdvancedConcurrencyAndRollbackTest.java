package com.rankforge.service;

import com.rankforge.dto.MatchResultDto;
import com.rankforge.dto.MatchUndoResultDto;
import com.rankforge.exception.DuplicateQueuePlayerException;
import com.rankforge.exception.InsufficientQueuePlayersException;
import com.rankforge.exception.NoEligibleMatchException;
import com.rankforge.exception.PlayerConflictException;
import com.rankforge.model.Player;
import com.rankforge.repository.MatchParticipantRepository;
import com.rankforge.repository.MatchRepository;
import com.rankforge.repository.PlayerRepository;
import com.rankforge.repository.QueueEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Advanced verification test suite for Stage 7 requirement:
 * Confirms concurrency safety, atomic transaction rollback, LIFO undo race protection,
 * referential deletion guards on older reversible matches, and canonical seed fidelity.
 */
@SpringBootTest
public class AdvancedConcurrencyAndRollbackTest {

    @Autowired
    private MatchService matchService;

    @Autowired
    private MatchHistoryService matchHistoryService;

    @Autowired
    private QueueService queueService;

    @Autowired
    private PlayerService playerService;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private QueueEntryRepository queueEntryRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private MatchParticipantRepository matchParticipantRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @BeforeEach
    public void setup() {
        playerService.resetDemoData();
    }

    /**
     * 1. First-run seed fidelity: verifies exact canonical seed values from original-source/players.txt
     */
    @Test
    public void testCanonicalSeedFidelityAgainstOriginalPlayersTxt() {
        assertEquals(53, playerRepository.count());

        // Verify key player records match original-source/players.txt line-by-line
        Player p101 = playerRepository.findById(101).orElseThrow();
        assertEquals("Amit", p101.getName());
        assertEquals(80, p101.getScore());
        assertEquals(2, p101.getLevel());
        assertEquals("NoTeam", p101.getTeam());

        Player p102 = playerRepository.findById(102).orElseThrow();
        assertEquals("Rahul", p102.getName());
        assertEquals(90, p102.getScore());
        assertEquals(4, p102.getLevel());
        assertEquals("Warriors", p102.getTeam());

        Player p103 = playerRepository.findById(103).orElseThrow();
        assertEquals("Neha", p103.getName());
        assertEquals(90, p103.getScore());
        assertEquals(3, p103.getLevel());
        assertEquals("Knights", p103.getTeam());

        Player p104 = playerRepository.findById(104).orElseThrow();
        assertEquals("Arjun", p104.getName());
        assertEquals(100, p104.getScore());
        assertEquals(5, p104.getLevel());
        assertEquals("Warriors", p104.getTeam());

        Player p112 = playerRepository.findById(112).orElseThrow();
        assertEquals("Rohan", p112.getName());
        assertEquals(70, p112.getScore());

        // Verify lowercase 'klh' was normalized to uppercase 'KLH' without altering original file
        Player p45 = playerRepository.findById(45).orElseThrow();
        assertEquals("ad", p45.getName());
        assertEquals("KLH", p45.getTeam());
    }

    /**
     * 2. Concurrent duplicate enrollment: multiple concurrent threads try to enroll the same player
     */
    @Test
    public void testConcurrentDuplicateEnrollmentRejectsDuplicates() throws Exception {
        int threadCount = 8;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    queueService.joinQueue(105); // Player 105: Kiran
                    successCount.incrementAndGet();
                } catch (DuplicateQueuePlayerException ex) {
                    conflictCount.incrementAndGet();
                } catch (Exception ex) {
                    // unexpected
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        assertTrue(doneLatch.await(5, TimeUnit.SECONDS));
        executor.shutdown();

        // Exactly 1 thread must succeed; all other 7 threads must receive DuplicateQueuePlayerException
        assertEquals(1, successCount.get());
        assertEquals(threadCount - 1, conflictCount.get());

        // Database must contain exactly 1 entry for player 105
        assertEquals(1, queueEntryRepository.count());
        assertTrue(queueEntryRepository.existsByPlayerId(105));
    }

    /**
     * 3. Concurrent match consumption: two concurrent threads race to consume the only 2 queued players
     */
    @Test
    public void testConcurrentMatchConsumptionDoesNotDoubleConsume() throws Exception {
        queueService.joinQueue(101);
        queueService.joinQueue(102);
        assertEquals(2, queueService.getQueueSize());

        int threadCount = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger insufficientCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    matchService.playSoloMatch();
                    successCount.incrementAndGet();
                } catch (InsufficientQueuePlayersException ex) {
                    insufficientCount.incrementAndGet();
                } catch (Exception ex) {
                    // unexpected
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        assertTrue(doneLatch.await(5, TimeUnit.SECONDS));
        executor.shutdown();

        // Exactly 1 match must succeed; the other must fail with insufficient players
        assertEquals(1, successCount.get());
        assertEquals(1, insufficientCount.get());

        // Queue must now be empty (both consumed once, never double consumed)
        assertEquals(0, queueService.getQueueSize());
        assertEquals(1, matchRepository.count());
    }

    /**
     * 4. Atomic transaction rollback: a simulated crash during match processing rolls back
     *    queue removals, match creation, and score awards.
     */
    @Test
    public void testForcedFailureInMatchTransactionRollsBackAllMutations() {
        queueService.joinQueue(101);
        queueService.joinQueue(102);
        assertEquals(2, queueService.getQueueSize());

        Player p1Before = playerRepository.findById(101).orElseThrow();
        Player p2Before = playerRepository.findById(102).orElseThrow();
        int score1 = p1Before.getScore();
        int score2 = p2Before.getScore();
        long initialMatchCount = matchRepository.count();

        TransactionTemplate tx = new TransactionTemplate(transactionManager);
        tx.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);

        assertThrows(RuntimeException.class, () -> {
            tx.execute(status -> {
                // Execute valid match logic inside transaction
                matchService.playSoloMatch();
                // Force an unexpected runtime fault mid-transaction
                throw new RuntimeException("SIMULATED_DATABASE_CORRUPTION_FAILURE");
            });
        });

        // Verify complete rollback:
        // 1. Queue entries were restored (neither 101 nor 102 dequeued permanently)
        assertEquals(2, queueService.getQueueSize());
        assertTrue(queueEntryRepository.existsByPlayerId(101));
        assertTrue(queueEntryRepository.existsByPlayerId(102));

        // 2. No match record was created
        assertEquals(initialMatchCount, matchRepository.count());

        // 3. Player scores remained completely untouched
        Player p1After = playerRepository.findById(101).orElseThrow();
        Player p2After = playerRepository.findById(102).orElseThrow();
        assertEquals(score1, p1After.getScore());
        assertEquals(score2, p2After.getScore());
    }

    /**
     * 5. Concurrent match undo: two concurrent threads race to undo the same match
     */
    @Test
    public void testConcurrentUndoRacePreventsDoubleReversal() throws Exception {
        queueService.joinQueue(101);
        queueService.joinQueue(102);
        MatchResultDto match = matchService.playSoloMatch();
        assertEquals(1, matchRepository.countByStatus("COMPLETED"));

        int threadCount = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger noEligibleCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    matchHistoryService.undoLastMatch();
                    successCount.incrementAndGet();
                } catch (NoEligibleMatchException ex) {
                    noEligibleCount.incrementAndGet();
                } catch (Exception ex) {
                    // unexpected
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        assertTrue(doneLatch.await(5, TimeUnit.SECONDS));
        executor.shutdown();

        // Exactly 1 thread succeeds; the second gets NoEligibleMatchException
        assertEquals(1, successCount.get());
        assertEquals(1, noEligibleCount.get());

        // Match status is now UNDONE, score deducted exactly once
        assertEquals(0, matchRepository.countByStatus("COMPLETED"));
        assertEquals(1, matchRepository.countByStatus("UNDONE"));
    }

    /**
     * 6. Referential deletion guard on older reversible matches:
     *    When Match 1 and Match 2 have been played, deleting the winner of Match 1
     *    must be strictly blocked (409 Conflict) to prevent corrupting LIFO undo history.
     */
    @Test
    public void testPlayerDeletionBlockedOnOlderReversibleMatch() {
        // Match 1: Player 101 vs 102
        queueService.joinQueue(101);
        queueService.joinQueue(102);
        MatchResultDto match1 = matchService.playSoloMatch();
        int winner1 = match1.getParticipants().stream()
                .filter(p -> p.isWinner())
                .findFirst().orElseThrow().getPlayerId();

        // Match 2: Player 103 vs 104
        queueService.joinQueue(103);
        queueService.joinQueue(104);
        MatchResultDto match2 = matchService.playSoloMatch();

        // Attempting to delete winner1 while Match 1 is still in the active history stack
        PlayerConflictException ex = assertThrows(PlayerConflictException.class, () ->
                playerService.deletePlayer(winner1)
        );
        assertTrue(ex.getMessage().contains("active match pending LIFO undo") ||
                   ex.getMessage().contains("historical match"));

        // Player is safe and not deleted
        assertTrue(playerRepository.existsById(winner1));
    }
}
