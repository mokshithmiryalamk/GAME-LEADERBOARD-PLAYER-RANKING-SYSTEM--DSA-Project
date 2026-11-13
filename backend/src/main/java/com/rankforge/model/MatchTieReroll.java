package com.rankforge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

/**
 * Record of sudden death rerolls executed during tied match outcomes.
 */
@Entity
@Table(name = "match_tie_rerolls")
public class MatchTieReroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    @JsonIgnore
    private Match match;

    @Column(name = "round_number", nullable = false)
    private int roundNumber;

    @Column(name = "side_alpha_roll", nullable = false)
    private int sideAlphaRoll;

    @Column(name = "side_omega_roll", nullable = false)
    private int sideOmegaRoll;

    public MatchTieReroll() {
    }

    public MatchTieReroll(int roundNumber, int sideAlphaRoll, int sideOmegaRoll) {
        this.roundNumber = roundNumber;
        this.sideAlphaRoll = sideAlphaRoll;
        this.sideOmegaRoll = sideOmegaRoll;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Match getMatch() {
        return match;
    }

    public void setMatch(Match match) {
        this.match = match;
    }

    public int getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(int roundNumber) {
        this.roundNumber = roundNumber;
    }

    public int getSideAlphaRoll() {
        return sideAlphaRoll;
    }

    public void setSideAlphaRoll(int sideAlphaRoll) {
        this.sideAlphaRoll = sideAlphaRoll;
    }

    public int getSideOmegaRoll() {
        return sideOmegaRoll;
    }

    public void setSideOmegaRoll(int sideOmegaRoll) {
        this.sideOmegaRoll = sideOmegaRoll;
    }
}
