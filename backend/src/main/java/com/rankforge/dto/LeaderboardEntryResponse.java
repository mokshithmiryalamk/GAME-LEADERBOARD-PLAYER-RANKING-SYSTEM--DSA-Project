package com.rankforge.dto;

import com.rankforge.model.Player;

/**
 * Data Transfer Object for Ranked Leaderboard Standings.
 * Emits the rank (1..N) along with complete player dossier attributes.
 */
public class LeaderboardEntryResponse {

    private int rank;
    private int id;
    private String name;
    private int score;
    private int level;
    private String team;

    public LeaderboardEntryResponse() {
    }

    public LeaderboardEntryResponse(int rank, Player player) {
        this.rank = rank;
        if (player != null) {
            this.id = player.getId();
            this.name = player.getName();
            this.score = player.getScore();
            this.level = player.getLevel();
            this.team = player.getTeam() != null ? player.getTeam() : "NoTeam";
        }
    }

    public int getRank() {
        return rank;
    }

    public void setRank(int rank) {
        this.rank = rank;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public String getTeam() {
        return team;
    }

    public void setTeam(String team) {
        this.team = team;
    }
}
