package com.rankforge.dto;

import jakarta.validation.constraints.NotNull;

public class JoinQueueRequest {

    @NotNull(message = "Player ID must be provided")
    private Integer playerId;

    public JoinQueueRequest() {
    }

    public JoinQueueRequest(Integer playerId) {
        this.playerId = playerId;
    }

    public Integer getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Integer playerId) {
        this.playerId = playerId;
    }
}
