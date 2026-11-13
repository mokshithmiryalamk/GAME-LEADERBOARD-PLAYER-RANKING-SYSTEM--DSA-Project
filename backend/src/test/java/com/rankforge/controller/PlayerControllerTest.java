package com.rankforge.controller;

import com.rankforge.service.PlayerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class PlayerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PlayerService playerService;

    @Autowired
    private PlayerController playerController;

    @BeforeEach
    public void reset() {
        playerService.resetDemoData();
    }

    @Test
    public void testGetAllPlayersReturns53SeedRecords() throws Exception {
        mockMvc.perform(get("/api/players"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(53));
    }

    @Test
    public void testGetPlayerByIdSuccess() throws Exception {
        mockMvc.perform(get("/api/players/104"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(104))
                .andExpect(jsonPath("$.name").value("Arjun"))
                .andExpect(jsonPath("$.score").value(100));
    }

    @Test
    public void testGetPlayerByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/players/99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    public void testSearchByName() throws Exception {
        mockMvc.perform(get("/api/players/search").param("name", "Arjun"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(104));
    }

    @Test
    public void testSearchByTeam() throws Exception {
        mockMvc.perform(get("/api/players/search").param("team", "Warriors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThan(0)));
    }

    @Test
    public void testResetDemoDataEndpointSuccess() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/players/reset"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.totalPlayers").value(53));
    }

    @Test
    public void testResetDemoDataEndpointDisabledReturnsForbidden() throws Exception {
        org.springframework.test.util.ReflectionTestUtils.setField(playerController, "resetEnabled", false);
        try {
            mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/players/reset"))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value("Roster reset is restricted in this environment."));
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(playerController, "resetEnabled", true);
        }
    }
}
