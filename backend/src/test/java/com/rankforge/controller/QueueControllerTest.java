package com.rankforge.controller;

import com.rankforge.repository.PlayerRepository;
import com.rankforge.service.QueueService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class QueueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private QueueService queueService;

    @Autowired
    private PlayerRepository playerRepository;

    @BeforeEach
    public void cleanQueue() {
        queueService.clearQueue();
    }

    @Test
    public void testGetQueueInitiallyEmpty() throws Exception {
        mockMvc.perform(get("/api/queue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    public void testJoinQueueSuccess() throws Exception {
        mockMvc.perform(post("/api/queue")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"playerId\": 104}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.position").value(1))
                .andExpect(jsonPath("$.slotIndex").value(0))
                .andExpect(jsonPath("$.player.id").value(104))
                .andExpect(jsonPath("$.player.name").value("Arjun"));

        mockMvc.perform(get("/api/queue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].player.id").value(104));
    }

    @Test
    public void testJoinQueueDuplicateThrowsConflict() throws Exception {
        mockMvc.perform(post("/api/queue")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"playerId\": 104}"))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/queue")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"playerId\": 104}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.detail").exists());
    }

    @Test
    public void testJoinQueueNonExistentPlayerThrowsNotFound() throws Exception {
        mockMvc.perform(post("/api/queue")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"playerId\": 99999}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    public void testLeaveQueue() throws Exception {
        queueService.joinQueue(104);
        assertEquals(1, queueService.getQueueSize());

        mockMvc.perform(delete("/api/queue/104"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        assertEquals(0, queueService.getQueueSize());
    }

    @Test
    public void testClearQueue() throws Exception {
        queueService.joinQueue(101);
        queueService.joinQueue(102);
        assertEquals(2, queueService.getQueueSize());

        mockMvc.perform(post("/api/queue/clear"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        assertEquals(0, queueService.getQueueSize());
    }

    @Test
    public void testQueueCapacityFiftyPlayersAndRejectFiftyFirst() throws Exception {
        // Enqueue first 50 valid players from authentic seed dataset
        List<Integer> playerIds = playerRepository.findAll().stream().map(com.rankforge.model.Player::getId).toList();
        for (int i = 0; i < 50; i++) {
            queueService.joinQueue(playerIds.get(i));
        }
        assertEquals(50, queueService.getQueueSize());

        // Attempting to enqueue 51st player must return 400 Bad Request
        int fiftyFirstId = playerIds.get(50);
        mockMvc.perform(post("/api/queue")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"playerId\": " + fiftyFirstId + "}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").value("Queue Full"))
                .andExpect(jsonPath("$.detail").value("Matchmaking lobby is at maximum capacity (50 players)."));

        assertEquals(50, queueService.getQueueSize());
    }

    private void assertEquals(int expected, int actual) {
        org.junit.jupiter.api.Assertions.assertEquals(expected, actual);
    }
}
