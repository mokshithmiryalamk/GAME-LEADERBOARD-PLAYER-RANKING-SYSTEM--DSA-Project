package com.rankforge.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Result DTO returned upon performing an atomic LIFO match undo.
 */
public class MatchUndoResultDto {

    private Long matchId;
    private String matchType;
    private Instant playedAt;
    private Instant undoneAt;
    private String message;
    private List<RevertedPlayerDto> revertedPlayers = new ArrayList<>();

    public MatchUndoResultDto() {
    }

    public MatchUndoResultDto(Long matchId, String matchType, Instant playedAt, Instant undoneAt,
                              String message, List<RevertedPlayerDto> revertedPlayers) {
        this.matchId = matchId;
        this.matchType = matchType;
        this.playedAt = playedAt;
        this.undoneAt = undoneAt;
        this.message = message;
        this.revertedPlayers = (revertedPlayers != null) ? revertedPlayers : new ArrayList<>();
    }

    public Long getMatchId() {
        return matchId;
    }

    public void setMatchId(Long matchId) {
        this.matchId = matchId;
    }

    public String getMatchType() {
        return matchType;
    }

    public void setMatchType(String matchType) {
        this.matchType = matchType;
    }

    public Instant getPlayedAt() {
        return playedAt;
    }

    public void setPlayedAt(Instant playedAt) {
        this.playedAt = playedAt;
    }

    public Instant getUndoneAt() {
        return undoneAt;
    }

    public void setUndoneAt(Instant undoneAt) {
        this.undoneAt = undoneAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<RevertedPlayerDto> getRevertedPlayers() {
        return revertedPlayers;
    }

    public void setRevertedPlayers(List<RevertedPlayerDto> revertedPlayers) {
        this.revertedPlayers = revertedPlayers;
    }
}
