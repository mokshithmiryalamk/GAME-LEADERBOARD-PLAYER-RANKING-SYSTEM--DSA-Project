package com.rankforge.dto;

public class RevertedPlayerDto {

    private int playerId;
    private String playerName;
    private int pointsDeducted;
    private int newScore;

    public RevertedPlayerDto() {
    }

    public RevertedPlayerDto(int playerId, String playerName, int pointsDeducted, int newScore) {
        this.playerId = playerId;
        this.playerName = playerName;
        this.pointsDeducted = pointsDeducted;
        this.newScore = newScore;
    }

    public int getPlayerId() {
        return playerId;
    }

    public void setPlayerId(int playerId) {
        this.playerId = playerId;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public int getPointsDeducted() {
        return pointsDeducted;
    }

    public void setPointsDeducted(int pointsDeducted) {
        this.pointsDeducted = pointsDeducted;
    }

    public int getNewScore() {
        return newScore;
    }

    public void setNewScore(int newScore) {
        this.newScore = newScore;
    }
}
