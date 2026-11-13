package com.rankforge.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Result DTO returned upon match completion or match detail retrieval.
 */
public class MatchResultDto {

    private Long matchId;
    private String matchType; // "1v1" or "2v2"
    private String status;    // "COMPLETED" or "UNDONE"
    private String winningSide; // "ALPHA" or "OMEGA"
    private int scoreAward;
    private String summary;
    private Instant playedAt;
    private Instant undoneAt;
    private List<ParticipantResultDto> participants = new ArrayList<>();
    private List<TieRerollDto> tieRerolls = new ArrayList<>();

    public MatchResultDto() {
    }

    public MatchResultDto(Long matchId, String matchType, String status, String winningSide,
                          int scoreAward, String summary, Instant playedAt, Instant undoneAt,
                          List<ParticipantResultDto> participants, List<TieRerollDto> tieRerolls) {
        this.matchId = matchId;
        this.matchType = matchType;
        this.status = status;
        this.winningSide = winningSide;
        this.scoreAward = scoreAward;
        this.summary = summary;
        this.playedAt = playedAt;
        this.undoneAt = undoneAt;
        this.participants = (participants != null) ? participants : new ArrayList<>();
        this.tieRerolls = (tieRerolls != null) ? tieRerolls : new ArrayList<>();
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getWinningSide() {
        return winningSide;
    }

    public void setWinningSide(String winningSide) {
        this.winningSide = winningSide;
    }

    public int getScoreAward() {
        return scoreAward;
    }

    public void setScoreAward(int scoreAward) {
        this.scoreAward = scoreAward;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
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

    public List<ParticipantResultDto> getParticipants() {
        return participants;
    }

    public void setParticipants(List<ParticipantResultDto> participants) {
        this.participants = participants;
    }

    public List<TieRerollDto> getTieRerolls() {
        return tieRerolls;
    }

    public void setTieRerolls(List<TieRerollDto> tieRerolls) {
        this.tieRerolls = tieRerolls;
    }
}
