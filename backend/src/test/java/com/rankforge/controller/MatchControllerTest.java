package com.rankforge.controller;

import com.rankforge.service.QueueService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class MatchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private QueueService queueService;

    @BeforeEach
    public void setup() {
        queueService.clearQueue();
    }

    @Test
    public void testPlaySoloMatchViaPost() throws Exception {
        queueService.joinQueue(101);
        queueService.joinQueue(102);

        mockMvc.perform(post("/api/matches/play")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"matchType\": \"1v1\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.matchType").value("1v1"))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.participants.length()").value(2));
    }

    @Test
    public void testPlayTeamMatchViaPost() throws Exception {
        queueService.joinQueue(101);
        queueService.joinQueue(102);
        queueService.joinQueue(103);
        queueService.joinQueue(104);

        mockMvc.perform(post("/api/matches/team"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.matchType").value("2v2"))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.participants.length()").value(4));
    }

    @Test
    public void testGetMatchHistory() throws Exception {
        mockMvc.perform(get("/api/matches"))
                .andExpect(status().isOk());
    }

    @Test
    public void testUndoEndpoint() throws Exception {
        queueService.joinQueue(101);
        queueService.joinQueue(102);

        mockMvc.perform(post("/api/matches/solo"))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/matches/undo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.revertedPlayers.length()").value(1));
    }
}
