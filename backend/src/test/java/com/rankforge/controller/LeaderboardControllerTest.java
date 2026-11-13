package com.rankforge.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class LeaderboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testLeaderboardReturnsRankedStandings() throws Exception {
        mockMvc.perform(get("/api/leaderboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].rank").value(1))
                .andExpect(jsonPath("$[0].name").value("Arjun"))
                .andExpect(jsonPath("$[0].score").value(100));
    }

    @Test
    public void testLeaderboardWithLimit() throws Exception {
        mockMvc.perform(get("/api/leaderboard").param("limit", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].rank").value(1))
                .andExpect(jsonPath("$[1].rank").value(2))
                .andExpect(jsonPath("$[2].rank").value(3));
    }

    @Test
    public void testLeaderboardWithTeamFilter() throws Exception {
        mockMvc.perform(get("/api/leaderboard").param("team", "Knights"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].team").value("Knights"));
    }
}
