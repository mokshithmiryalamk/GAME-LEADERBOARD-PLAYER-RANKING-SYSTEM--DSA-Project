package com.rankforge.dto;

/**
 * Result DTO for an individual match participant.
 */
public class ParticipantResultDto {

    private int playerId;
    private String playerName;
    private String playerTeam;
    private int playerLevel;
    private String side; // "ALPHA" or "OMEGA"
    private int diceRoll;
    private boolean isWinner;
    private int scoreDelta;
    private int updatedScore;

    public ParticipantResultDto() {
    }

    public ParticipantResultDto(int playerId, String playerName, String playerTeam, int playerLevel,
                                String side, int diceRoll, boolean isWinner, int scoreDelta, int updatedScore) {
        this.playerId = playerId;
        this.playerName = playerName;
        this.playerTeam = playerTeam;
        this.playerLevel = playerLevel;
        this.side = side;
        this.diceRoll = diceRoll;
        this.isWinner = isWinner;
        this.scoreDelta = scoreDelta;
        this.updatedScore = updatedScore;
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

    public int getUpdatedScore() {
        return updatedScore;
    }

    public void setUpdatedScore(int updatedScore) {
        this.updatedScore = updatedScore;
    }
}
