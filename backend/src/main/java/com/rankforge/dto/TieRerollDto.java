package com.rankforge.dto;

public class TieRerollDto {

    private int roundNumber;
    private int sideAlphaRoll;
    private int sideOmegaRoll;

    public TieRerollDto() {
    }

    public TieRerollDto(int roundNumber, int sideAlphaRoll, int sideOmegaRoll) {
        this.roundNumber = roundNumber;
        this.sideAlphaRoll = sideAlphaRoll;
        this.sideOmegaRoll = sideOmegaRoll;
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
