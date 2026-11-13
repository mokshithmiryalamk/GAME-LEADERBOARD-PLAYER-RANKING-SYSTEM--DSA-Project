package com.rankforge.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class InMemoryPlayerRepositoryTest {

    @Autowired
    private InMemoryPlayerRepository repository;

    @Test
    public void testRepositoryLoadsExactly53ValidPlayers() {
        assertEquals(53, repository.count());
    }

    @Test
    public void testMalformedLine50IsQuarantined() {
        assertEquals(1, repository.getQuarantinedRows().size());
        String quarantined = repository.getQuarantinedRows().get(0);
        assertTrue(quarantined.contains("Shreya"));
        assertTrue(quarantined.contains("Dragonshi"));
    }

    @Test
    public void testFindByIdHash() {
        assertTrue(repository.findById(104).isPresent());
        assertEquals("Arjun", repository.findById(104).get().getName());
        assertFalse(repository.findById(99999).isPresent());
    }
}
