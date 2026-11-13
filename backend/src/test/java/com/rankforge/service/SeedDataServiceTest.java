package com.rankforge.service;

import com.rankforge.model.Player;
import com.rankforge.repository.PlayerRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class SeedDataServiceTest {

    @Autowired
    private SeedDataService seedDataService;

    @Autowired
    private PlayerRepository playerRepository;

    @Test
    public void testAuditExtractsExactly53ValidRecords() {
        assertEquals(53, seedDataService.getTotalParsedCount());
        List<Player> cached = seedDataService.getCachedSeedPlayers();
        assertEquals(53, cached.size());
    }

    @Test
    public void testMalformedLine50IsQuarantined() {
        assertEquals(1, seedDataService.getQuarantinedCount());
        assertNotNull(seedDataService.getQuarantineReason());
        assertTrue(seedDataService.getQuarantineReason().contains("Line 50"));
        assertTrue(seedDataService.getQuarantineReason().contains("Shreya"));
    }

    @Test
    public void testDatabaseContains53SeedPlayers() {
        long count = playerRepository.count();
        assertEquals(53, count);
    }

    @Test
    public void testIdempotentSeedingDoesNotDuplicate() {
        long initialCount = playerRepository.count();
        seedDataService.seedDatabaseIfEmpty();
        assertEquals(initialCount, playerRepository.count());
    }
}
