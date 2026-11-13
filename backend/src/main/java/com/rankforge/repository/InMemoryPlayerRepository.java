package com.rankforge.repository;

import com.rankforge.model.Player;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Repository;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * In-Memory Player Repository for RANKFORGE Stage 5.
 * Directly preserves and adapts original `PlayerArray.java`:
 * - `Player[] players` -> List<Player> backed by in-memory array storage
 * - `HashMap<Integer, Player> playerById` -> ConcurrentHashMap for O(1) hash search
 * - `loadFromFile()` -> parses original `players.txt` with strict schema validation
 *
 * Fault Tolerance & Quarantine:
 * Rejects and quarantines the known malformed line 50 without crashing,
 * preserving exactly 53 valid authentic records.
 */
@Repository
public class InMemoryPlayerRepository {

    private static final Logger log = LoggerFactory.getLogger(InMemoryPlayerRepository.class);

    @Value("${rankforge.data.players-file:original-source/players.txt}")
    private String playersFilePath;

    private final List<Player> playerList = new CopyOnWriteArrayList<>();
    private final Map<Integer, Player> playerById = new ConcurrentHashMap<>();
    private final List<String> quarantinedRows = new CopyOnWriteArrayList<>();

    @PostConstruct
    public void init() {
        loadFromSource();
    }

    /**
     * Loads player seed data from original-source/players.txt or classpath fallback.
     */
    public synchronized void loadFromSource() {
        playerList.clear();
        playerById.clear();
        quarantinedRows.clear();

        BufferedReader reader = null;
        try {
            File directFile = new File(playersFilePath);
            if (!directFile.exists()) {
                // Try parent-relative path if executed from backend/
                directFile = new File("../" + playersFilePath);
            }

            if (directFile.exists()) {
                log.info("Loading seed players from file: {}", directFile.getAbsolutePath());
                reader = new BufferedReader(new FileReader(directFile, StandardCharsets.UTF_8));
            } else {
                log.info("Direct file not found, loading bundled classpath resource: players.txt");
                ClassPathResource resource = new ClassPathResource("players.txt");
                reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8));
            }

            String line;
            int lineNumber = 0;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                line = line.trim();
                if (line.isEmpty()) {
                    continue;
                }

                String[] data = line.split(",");
                // Strict schema check: original format is name,id,score,level,team (exactly 5 fields)
                if (data.length != 5) {
                    log.warn("Quarantining malformed record at line {}: '{}' (expected 5 fields, found {})",
                            lineNumber, line, data.length);
                    quarantinedRows.add(line);
                    continue;
                }

                try {
                    String name = data[0].trim();
                    int id = Integer.parseInt(data[1].trim());
                    int score = Integer.parseInt(data[2].trim());
                    int level = Integer.parseInt(data[3].trim());
                    String team = data[4].trim();

                    // Standardize team labeling
                    if ("null".equalsIgnoreCase(team) || "NoTeam".equalsIgnoreCase(team)) {
                        team = "NoTeam";
                    }

                    Player p = new Player(name, id, score, team, level);
                    playerList.add(p);
                    playerById.put(p.getId(), p);

                } catch (NumberFormatException nfe) {
                    log.warn("Quarantining record with unparseable numbers at line {}: '{}'", lineNumber, line);
                    quarantinedRows.add(line);
                }
            }

            log.info("Loaded {} valid player records into memory (quarantined {} malformed lines).",
                    playerList.size(), quarantinedRows.size());

        } catch (Exception e) {
            log.error("Failed to load players seed file: {}", e.getMessage(), e);
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (Exception ignored) {}
            }
        }
    }

    public List<Player> findAll() {
        List<Player> snapshot = new ArrayList<>(playerList.size());
        for (Player p : playerList) {
            snapshot.add(new Player(p));
        }
        return snapshot;
    }

    /**
     * O(1) Hash Map Search modeled after `PlayerArray.searchByIdHash(int id)`
     */
    public Optional<Player> findById(int id) {
        Player p = playerById.get(id);
        return p != null ? Optional.of(new Player(p)) : Optional.empty();
    }

    /**
     * O(N) Linear Search by Name modeled after `PlayerArray.linearSearchByName(String name)`
     */
    public List<Player> findByName(String name) {
        if (name == null || name.isBlank()) {
            return Collections.emptyList();
        }
        List<Player> matches = new ArrayList<>();
        for (Player p : playerList) {
            if (p.getName().equalsIgnoreCase(name.trim())) {
                matches.add(new Player(p));
            }
        }
        return matches;
    }

    /**
     * O(N) Linear Search by Team modeled after `PlayerArray.linearSearchByTeam(String team)`
     */
    public List<Player> findByTeam(String team) {
        if (team == null || team.isBlank()) {
            return Collections.emptyList();
        }
        List<Player> matches = new ArrayList<>();
        for (Player p : playerList) {
            if (p.getTeam() != null && p.getTeam().equalsIgnoreCase(team.trim())) {
                matches.add(new Player(p));
            }
        }
        return matches;
    }

    public synchronized Player save(Player player) {
        if (player == null) {
            throw new IllegalArgumentException("Player cannot be null");
        }
        Player existing = playerById.get(player.getId());
        if (existing != null) {
            existing.setName(player.getName());
            existing.setLevel(player.getLevel());
            existing.setTeam(player.getTeam());
            existing.setScore(player.getScore());
            return new Player(existing);
        } else {
            Player copy = new Player(player);
            playerList.add(copy);
            playerById.put(copy.getId(), copy);
            return new Player(copy);
        }
    }

    public synchronized boolean deleteById(int id) {
        Player existing = playerById.remove(id);
        if (existing != null) {
            playerList.remove(existing);
            return true;
        }
        return false;
    }

    public int count() {
        return playerList.size();
    }

    public List<String> getQuarantinedRows() {
        return Collections.unmodifiableList(quarantinedRows);
    }
}
