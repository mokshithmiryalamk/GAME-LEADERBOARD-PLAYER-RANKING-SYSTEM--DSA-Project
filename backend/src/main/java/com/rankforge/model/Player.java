package com.rankforge.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;

/**
 * Core Player Entity representing a contender in RANKFORGE.
 * Directly preserves and adapts the original academic `Player.java` specification:
 * - Package: Game_Leaderboard_And_Player_Ranking_System.Player
 * - Identical fields: id, name, score, level, team
 * - Identical 4 overloaded constructors for new vs loaded, solo vs team contenders
 * - Persisted as a JPA Entity in the 'players' table.
 */
@Entity
@Table(name = "players")
public class Player {

    @Id
    @Column(name = "id", nullable = false)
    private int id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "score", nullable = false)
    private int score;

    @Column(name = "level", nullable = false)
    private int level;

    @Column(name = "team", length = 100)
    private String team;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    // Default constructor for JPA and Jackson JSON serialization
    public Player() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // 1. Original Constructor for NEW single player (score starts at 0, team is null)
    public Player(String name, int id, int level) {
        this();
        this.name = name;
        this.id = id;
        this.level = level;
        this.score = 0;
        this.team = null;
    }

    // 2. Original Constructor for NEW team player (score starts at 0)
    public Player(String name, int id, String team, int level) {
        this();
        this.name = name;
        this.id = id;
        this.team = team;
        this.level = level;
        this.score = 0;
    }

    // 3. Original Constructor for LOADING single player from file
    public Player(String name, int id, int score, int level) {
        this();
        this.name = name;
        this.id = id;
        this.score = score;
        this.level = level;
        this.team = null;
    }

    // 4. Original Constructor for LOADING team player from file
    public Player(String name, int id, int score, String team, int level) {
        this();
        this.name = name;
        this.id = id;
        this.score = score;
        this.team = team;
        this.level = level;
    }

    // Copy constructor for immutable snapshotting
    public Player(Player other) {
        if (other != null) {
            this.id = other.id;
            this.name = other.name;
            this.score = other.score;
            this.level = other.level;
            this.team = other.team;
            this.createdAt = other.createdAt != null ? other.createdAt : Instant.now();
            this.updatedAt = other.updatedAt != null ? other.updatedAt : Instant.now();
        }
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Score adjustments: exact mathematical adjustments, no silent zero-clamping
    public void incrementScore(int points) {
        this.score += points;
    }

    public void decrementScore(int points) {
        this.score -= points;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Player player = (Player) o;
        return id == player.id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // Original toString() implementation from academic Player.java
    @Override
    public String toString() {
        String teamName = (team == null || team.equals("null")) ? "-" : team;
        return String.format("%-5d | %-20s | %-15s | %-6d | %-5d",
                id, name, teamName, level, score);
    }
}
