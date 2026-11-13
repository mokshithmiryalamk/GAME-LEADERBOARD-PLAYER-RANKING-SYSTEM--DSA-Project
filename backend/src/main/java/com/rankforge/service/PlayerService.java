package com.rankforge.service;

import com.rankforge.exception.DuplicatePlayerException;
import com.rankforge.exception.PlayerConflictException;
import com.rankforge.exception.PlayerNotFoundException;
import com.rankforge.model.Player;
import com.rankforge.repository.MatchParticipantRepository;
import com.rankforge.repository.MatchRepository;
import com.rankforge.repository.PlayerRepository;
import com.rankforge.repository.QueueEntryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Core business service for player lifecycle management, backed by Spring Data JPA.
 */
@Service
public class PlayerService {

    private static final Logger log = LoggerFactory.getLogger(PlayerService.class);

    private final PlayerRepository playerRepository;
    private final QueueEntryRepository queueEntryRepository;
    private final MatchRepository matchRepository;
    private final MatchParticipantRepository matchParticipantRepository;
    private final SeedDataService seedDataService;

    public PlayerService(PlayerRepository playerRepository,
                         QueueEntryRepository queueEntryRepository,
                         MatchRepository matchRepository,
                         MatchParticipantRepository matchParticipantRepository,
                         SeedDataService seedDataService) {
        this.playerRepository = playerRepository;
        this.queueEntryRepository = queueEntryRepository;
        this.matchRepository = matchRepository;
        this.matchParticipantRepository = matchParticipantRepository;
        this.seedDataService = seedDataService;
    }

    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    public Player getPlayerById(int id) {
        return playerRepository.findById(id)
                .orElseThrow(() -> new PlayerNotFoundException(id));
    }

    /**
     * Executes algorithmic linear searches matching original PlayerArray search methods.
     */
    public List<Player> search(String query, String name, String team) {
        List<Player> all = playerRepository.findAll();
        List<Player> matches = new ArrayList<>();

        String targetQuery = (query != null && !query.isBlank()) ? query.trim().toLowerCase() : null;
        String targetName = (name != null && !name.isBlank()) ? name.trim().toLowerCase() : null;
        String targetTeam = (team != null && !team.isBlank()) ? team.trim().toLowerCase() : null;

        for (Player p : all) {
            boolean matchesQuery = (targetQuery == null) ||
                    (p.getName() != null && p.getName().toLowerCase().contains(targetQuery)) ||
                    (p.getTeam() != null && p.getTeam().toLowerCase().contains(targetQuery));

            boolean matchesName = (targetName == null) ||
                    (p.getName() != null && p.getName().toLowerCase().contains(targetName));

            boolean matchesTeam = (targetTeam == null) ||
                    (p.getTeam() != null && p.getTeam().toLowerCase().contains(targetTeam));

            if (matchesQuery && matchesName && matchesTeam) {
                matches.add(p);
            }
        }

        return matches;
    }

    @Transactional
    public Player createPlayer(Player newPlayer) {
        if (newPlayer.getId() <= 0) {
            throw new IllegalArgumentException("Player ID must be a positive integer.");
        }
        if (playerRepository.existsById(newPlayer.getId())) {
            throw new DuplicatePlayerException(newPlayer.getId());
        }
        if (newPlayer.getName() == null || newPlayer.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Player name must not be empty.");
        }
        if (newPlayer.getLevel() < 1) {
            newPlayer.setLevel(1);
        }

        String normalizedTeam = (newPlayer.getTeam() == null || newPlayer.getTeam().trim().isEmpty()
                || "null".equalsIgnoreCase(newPlayer.getTeam())) ? "Solo" : newPlayer.getTeam().trim();

        // New players start with score 0 per academic constructor Player(name, id, level)
        Player entity = new Player(newPlayer.getName().trim(), newPlayer.getId(), normalizedTeam, newPlayer.getLevel());
        entity.setScore(0);

        return playerRepository.save(entity);
    }

    @Transactional
    public Player updatePlayer(int id, Player updateData) {
        Player existing = getPlayerById(id);

        if (updateData.getName() != null && !updateData.getName().trim().isEmpty()) {
            existing.setName(updateData.getName().trim());
        }
        if (updateData.getLevel() >= 1) {
            existing.setLevel(updateData.getLevel());
        }
        if (updateData.getTeam() != null) {
            String team = updateData.getTeam().trim();
            existing.setTeam(team.isEmpty() || "null".equalsIgnoreCase(team) ? "Solo" : team);
        }

        // Note: Score is deliberately protected and NOT updated via standard profile updates.
        // Match scores are exclusively managed by the transactional Match and Undo engines.

        return playerRepository.save(existing);
    }

    @Transactional
    public void deletePlayer(int id) {
        Player existing = getPlayerById(id);

        // 1. Guard against deleting players in active reversible matches pending LIFO undo
        if (matchParticipantRepository.existsWinningParticipantInCompletedMatch(id)) {
            throw new PlayerConflictException(String.format(
                    "Cannot delete Player #%d: player is a winning participant in an active match pending LIFO undo. Revert the match before deleting.",
                    id));
        }

        // 2. Guard against foreign key violations with historical match records
        if (matchParticipantRepository.existsByPlayerId(id)) {
            throw new PlayerConflictException(String.format(
                    "Cannot delete Player #%d: player is referenced by historical match audit logs.",
                    id));
        }

        // 3. Remove from active queue if present
        queueEntryRepository.deleteByPlayerId(id);

        // 4. Delete player
        playerRepository.delete(existing);
        log.info("Deleted player #{} ({})", id, existing.getName());
    }

    @Transactional
    public void resetDemoData() {
        log.warn("Executing atomic database reset to restore 53 original seed players...");

        // 1. Clear queue entries
        queueEntryRepository.deleteAllInBatch();

        // 2. Clear match participants & matches
        matchParticipantRepository.deleteAllInBatch();
        matchRepository.deleteAllInBatch();

        // 3. Clear players
        playerRepository.deleteAllInBatch();

        // 4. Reload the 53 authentic seed players with original seed scores
        List<Player> seedRecords = seedDataService.getCachedSeedPlayers();
        List<Player> restored = new ArrayList<>();
        for (Player p : seedRecords) {
            restored.add(new Player(p.getName(), p.getId(), p.getScore(), p.getTeam(), p.getLevel()));
        }
        playerRepository.saveAll(restored);

        log.info("Reset complete: 53 seed players restored. Queue and match history cleared.");
    }

    public long getPlayerCount() {
        return playerRepository.count();
    }
}
