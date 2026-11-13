package com.rankforge.dto;

public class PlayMatchRequest {

    private String matchType = "1v1"; // "1v1" or "2v2"

    public PlayMatchRequest() {
    }

    public PlayMatchRequest(String matchType) {
        this.matchType = matchType;
    }

    public String getMatchType() {
        return matchType;
    }

    public void setMatchType(String matchType) {
        this.matchType = matchType;
    }
}
