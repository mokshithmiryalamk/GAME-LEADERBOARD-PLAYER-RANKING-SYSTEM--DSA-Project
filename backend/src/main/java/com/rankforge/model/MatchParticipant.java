package com.rankforge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

/**
 * Historical snapshot and score delta of a participant in an esports match.
 */
@Entity
@Table(name = "match_participants")
public class MatchParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    @JsonIgnore
    private Match match;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @Column(name = "player_name", nullable = false, length = 100)
    private String playerName;

    @Column(name = "player_team", length = 100)
    private String playerTeam;

    @Column(name = "player_level", nullable = false)
    private int playerLevel;

    @Column(name = "side", nullable = false, length = 10)
    private String side; // "ALPHA" or "OMEGA"

    @Column(name = "dice_roll", nullable = false)
    private int diceRoll;

    @Column(name = "is_winner", nullable = false)
    private boolean isWinner;

    @Column(name = "score_delta", nullable = false)
    private int scoreDelta;

    public MatchParticipant() {
    }

    public MatchParticipant(Player player, String side, int diceRoll, boolean isWinner, int scoreDelta) {
        this.player = player;
        this.playerName = player.getName();
        this.playerTeam = player.getTeam();
        this.playerLevel = player.getLevel();
        this.side = side;
        this.diceRoll = diceRoll;
        this.isWinner = isWinner;
        this.scoreDelta = scoreDelta;
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

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public String getPlayerTeam() {
        return playerTeam;
    }

    public void setPlayerTeam(String playerTeam) {
        this.playerTeam = playerTeam;
    }

    public int getPlayerLevel() {
        return playerLevel;
    }

    public void setPlayerLevel(int playerLevel) {
        this.playerLevel = playerLevel;
    }

    public String getSide() {
        return side;
    }

    public void setSide(String side) {
        this.side = side;
    }

    public int getDiceRoll() {
        return diceRoll;
    }

    public void setDiceRoll(int diceRoll) {
        this.diceRoll = diceRoll;
    }

    public boolean isWinner() {
        return isWinner;
    }

    public void setWinner(boolean winner) {
        isWinner = winner;
    }

    public int getScoreDelta() {
        return scoreDelta;
    }

    public void setScoreDelta(int scoreDelta) {
        this.scoreDelta = scoreDelta;
    }
}
