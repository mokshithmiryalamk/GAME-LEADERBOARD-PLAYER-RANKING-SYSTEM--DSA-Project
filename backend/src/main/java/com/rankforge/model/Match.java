package com.rankforge.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Persistent representation of an esports match (1v1 Solo or 2v2 Team Clash).
 */
@Entity
@Table(name = "matches")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "match_type", nullable = false, length = 10)
    private String matchType; // "1v1" or "2v2"

    @Column(name = "status", nullable = false, length = 20)
    private String status = "COMPLETED"; // "COMPLETED" or "UNDONE"

    @Column(name = "winning_side", length = 20)
    private String winningSide; // "ALPHA" or "OMEGA"

    @Column(name = "score_award", nullable = false)
    private int scoreAward = 10;

    @Column(name = "summary", length = 255)
    private String summary;

    @Column(name = "played_at", nullable = false)
    private Instant playedAt = Instant.now();

    @Column(name = "undone_at")
    private Instant undoneAt;

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<MatchParticipant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<MatchTieReroll> tieRerolls = new ArrayList<>();

    public Match() {
        this.playedAt = Instant.now();
    }

    public Match(String matchType, String winningSide, int scoreAward, String summary) {
        this();
        this.matchType = matchType;
        this.winningSide = winningSide;
        this.scoreAward = scoreAward;
        this.summary = summary;
        this.status = "COMPLETED";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public List<MatchParticipant> getParticipants() {
        return participants;
    }

    public void setParticipants(List<MatchParticipant> participants) {
        this.participants = participants;
    }

    public void addParticipant(MatchParticipant participant) {
        participants.add(participant);
        participant.setMatch(this);
    }

    public List<MatchTieReroll> getTieRerolls() {
        return tieRerolls;
    }

    public void setTieRerolls(List<MatchTieReroll> tieRerolls) {
        this.tieRerolls = tieRerolls;
    }

    public void addTieReroll(MatchTieReroll tieReroll) {
        tieRerolls.add(tieReroll);
        tieReroll.setMatch(this);
    }
}
