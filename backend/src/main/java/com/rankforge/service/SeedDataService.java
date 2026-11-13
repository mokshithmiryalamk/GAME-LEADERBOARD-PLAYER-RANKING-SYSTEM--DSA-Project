package com.rankforge.service;

import com.rankforge.model.Player;
import com.rankforge.repository.PlayerRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Service responsible for auditing, parsing, and seeding the authentic academic players.txt dataset.
 * Adheres strictly to the preservation and quarantine policy:
 * - Line 50 contains a concatenated record ('Shreya,150,90,5,Dragonshi,254,0,55,noiy') and is quarantined.
 * - Exactly 53 valid records are extracted.
 * - Casing is normalized consistently (e.g. 'klh' -> 'KLH', null -> 'Solo').
 */
@Service
public class SeedDataService {

    private static final Logger log = LoggerFactory.getLogger(SeedDataService.class);

    @Value("${rankforge.data.players-file:original-source/players.txt}")
    private String seedFilePath;

    private final PlayerRepository playerRepository;

    private int totalParsedCount = 0;
    private int quarantinedCount = 0;
    private String quarantineReason = null;
    private final List<Player> cachedSeedPlayers = new ArrayList<>();

    public SeedDataService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    @PostConstruct
    public void init() {
        auditAndLoadSeedFile();
        seedDatabaseIfEmpty();
    }

    public synchronized void auditAndLoadSeedFile() {
        cachedSeedPlayers.clear();
        totalParsedCount = 0;
        quarantinedCount = 0;
        quarantineReason = null;

        InputStream is = null;
        try {
            File file = new File(seedFilePath);
            if (file.exists()) {
                is = new FileInputStream(file);
                log.info("Loading seed players from filesystem: {}", file.getAbsolutePath());
            } else {
                Resource resource = new ClassPathResource("players.txt");
                if (resource.exists()) {
                    is = resource.getInputStream();
                    log.info("Loading seed players from classpath resource: players.txt");
                }
            }

            if (is == null) {
                log.warn("Seed file not found at {} or on classpath. Skipping seed audit.", seedFilePath);
                return;
            }

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                String line;
                int lineNum = 0;
                while ((line = reader.readLine()) != null) {
                    lineNum++;
                    line = line.trim();
                    if (line.isEmpty()) continue;

                    String[] tokens = line.split(",");
                    if (tokens.length != 5) {
                        quarantinedCount++;
                        quarantineReason = String.format("Line %d contains %d comma-separated fields (expected 5: name,id,score,level,team). Raw: '%s'",
                                lineNum, tokens.length, line);
                        log.warn("Quarantining malformed seed record at line {}: '{}' (expected 5 fields, found {})",
                                lineNum, line, tokens.length);
                        continue;
                    }

                    try {
                        String name = tokens[0].trim();
                        int id = Integer.parseInt(tokens[1].trim());
                        int score = Integer.parseInt(tokens[2].trim());
                        int level = Integer.parseInt(tokens[3].trim());
                        String team = tokens[4].trim();

                        if ("null".equalsIgnoreCase(team) || team.isEmpty()) {
                            team = "Solo";
                        } else if ("klh".equalsIgnoreCase(team)) {
                            team = "KLH";
                        }

                        Player player = new Player(name, id, score, team, level);
                        cachedSeedPlayers.add(player);
                        totalParsedCount++;
                    } catch (NumberFormatException nfe) {
                        quarantinedCount++;
                        quarantineReason = String.format("Line %d has invalid numeric format: %s", lineNum, nfe.getMessage());
                        log.warn("Quarantining unparseable number at line {}: {}", lineNum, line);
                    }
                }
            }
            log.info("Seed audit complete: {} valid records parsed, {} quarantined.", totalParsedCount, quarantinedCount);
        } catch (IOException e) {
            log.error("Failed to read seed data file: {}", e.getMessage(), e);
        } finally {
            if (is != null) {
                try { is.close(); } catch (IOException ignored) {}
            }
        }
    }

    public synchronized void seedDatabaseIfEmpty() {
        long currentCount = playerRepository.count();
        if (currentCount == 0 && !cachedSeedPlayers.isEmpty()) {
            log.info("Database empty. Performing first-run seed import of {} players...", cachedSeedPlayers.size());
            List<Player> toPersist = new ArrayList<>();
            for (Player p : cachedSeedPlayers) {
                toPersist.add(new Player(p.getName(), p.getId(), p.getScore(), p.getTeam(), p.getLevel()));
            }
            playerRepository.saveAll(toPersist);
            log.info("Successfully persisted {} seed players to the database.", toPersist.size());
        } else {
            log.info("Database already contains {} players. Preserving existing database state.", currentCount);
        }
    }

    public List<Player> getCachedSeedPlayers() {
        List<Player> copy = new ArrayList<>();
        for (Player p : cachedSeedPlayers) {
            copy.add(new Player(p.getName(), p.getId(), p.getScore(), p.getTeam(), p.getLevel()));
        }
        return copy;
    }

    public int getTotalParsedCount() {
        return totalParsedCount;
    }

    public int getQuarantinedCount() {
        return quarantinedCount;
    }

    public String getQuarantineReason() {
        return quarantineReason;
    }
}
