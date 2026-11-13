package com.rankforge.service;

import com.rankforge.dsa.JavaCircularQueue;
import com.rankforge.dto.QueueEntryResponse;
import com.rankforge.exception.DuplicateQueuePlayerException;
import com.rankforge.exception.PlayerNotFoundException;
import com.rankforge.exception.QueueCapacityExceededException;
import com.rankforge.model.Player;
import com.rankforge.model.QueueEntry;
import com.rankforge.repository.PlayerRepository;
import com.rankforge.repository.QueueEntryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Service managing the circular matchmaking queue.
 * Combines Java DSA circular pointer execution (JavaCircularQueue) with durable JPA persistence.
 */
@Service
public class QueueService {

    private static final Logger log = LoggerFactory.getLogger(QueueService.class);

    private final QueueEntryRepository queueEntryRepository;
    private final PlayerRepository playerRepository;

    public QueueService(QueueEntryRepository queueEntryRepository, PlayerRepository playerRepository) {
        this.queueEntryRepository = queueEntryRepository;
        this.playerRepository = playerRepository;
    }

    /**
     * Retrieves all active queued players in authentic FIFO order.
     */
    public List<QueueEntryResponse> getQueue() {
        List<QueueEntry> entries = queueEntryRepository.findAllByOrderByEnqueuedAtAsc();
        List<QueueEntryResponse> response = new ArrayList<>(entries.size());

        for (int i = 0; i < entries.size(); i++) {
            QueueEntry entry = entries.get(i);
            response.add(new QueueEntryResponse(
                    i + 1, // 1-based FIFO queue position
                    entry.getSlotIndex(),
                    entry.getPlayer(),
                    entry.getEnqueuedAt()
            ));
        }

        return response;
    }

    /**
     * Enqueues a player into the matchmaking lobby using genuine circular queue algorithms.
     */
    @Transactional
    public synchronized QueueEntryResponse joinQueue(int playerId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new PlayerNotFoundException(playerId));

        if (queueEntryRepository.existsByPlayerId(playerId)) {
            throw new DuplicateQueuePlayerException(playerId);
        }

        long currentCount = queueEntryRepository.count();
        if (currentCount >= JavaCircularQueue.DEFAULT_CAPACITY) {
            throw new QueueCapacityExceededException("Matchmaking lobby is at maximum capacity (50 players).");
        }

        // Reconstruct active JavaCircularQueue state to execute authentic DSA logic & modulo wraparound
        List<QueueEntry> activeEntries = queueEntryRepository.findAllByOrderByEnqueuedAtAsc();
        JavaCircularQueue circularQueue = new JavaCircularQueue(JavaCircularQueue.DEFAULT_CAPACITY);
        for (QueueEntry entry : activeEntries) {
            circularQueue.enqueue(entry.getPlayer());
        }

        // Execute genuine DSA enqueue with modulo wraparound
        int slotIndex = circularQueue.enqueue(player);

        QueueEntry savedEntry = queueEntryRepository.save(new QueueEntry(player, slotIndex, Instant.now()));
        log.info("Player #{} ({}) enqueued at position #{} (circular slot {})",
                player.getId(), player.getName(), activeEntries.size() + 1, slotIndex);

        return new QueueEntryResponse(
                activeEntries.size() + 1,
                slotIndex,
                savedEntry.getPlayer(),
                savedEntry.getEnqueuedAt()
        );
    }

    /**
     * Removes a player from anywhere in the matchmaking queue (Leave Lobby).
     */
    @Transactional
    public synchronized void leaveQueue(int playerId) {
        if (!queueEntryRepository.existsByPlayerId(playerId)) {
            throw new IllegalArgumentException("Player #" + playerId + " is not in the matchmaking lobby.");
        }

        queueEntryRepository.deleteByPlayerId(playerId);
        log.info("Player #{} left the matchmaking lobby.", playerId);
    }

    /**
     * Clears all players from the matchmaking lobby.
     */
    @Transactional
    public synchronized void clearQueue() {
        queueEntryRepository.deleteAllInBatch();
        log.info("Matchmaking lobby cleared.");
    }

    public int getQueueSize() {
        return (int) queueEntryRepository.count();
    }
}
