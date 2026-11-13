package com.rankforge.dto;

import java.time.Instant;

/**
 * Health check response DTO for GET /api/health
 */
public class HealthResponse {

    private String status;
    private String application;
    private String subtitle;
    private String version;
    private Instant timestamp;
    private int totalPlayers;
    private int quarantinedSeedRows;
    private int queueSize;
    private long totalMatches;
    private long activeStackDepth;
    private String databaseEngine;

    public HealthResponse() {
        this.timestamp = Instant.now();
    }

    public HealthResponse(String status, String application, String subtitle, String version,
                          int totalPlayers, int quarantinedSeedRows) {
        this();
        this.status = status;
        this.application = application;
        this.subtitle = subtitle;
        this.version = version;
        this.totalPlayers = totalPlayers;
        this.quarantinedSeedRows = quarantinedSeedRows;
    }

    public HealthResponse(String status, String application, String subtitle, String version,
                          int totalPlayers, int quarantinedSeedRows, int queueSize,
                          long totalMatches, long activeStackDepth, String databaseEngine) {
        this(status, application, subtitle, version, totalPlayers, quarantinedSeedRows);
        this.queueSize = queueSize;
        this.totalMatches = totalMatches;
        this.activeStackDepth = activeStackDepth;
        this.databaseEngine = databaseEngine;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getApplication() {
        return application;
    }

    public void setApplication(String application) {
        this.application = application;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public int getTotalPlayers() {
        return totalPlayers;
    }

    public void setTotalPlayers(int totalPlayers) {
        this.totalPlayers = totalPlayers;
    }

    public int getQuarantinedSeedRows() {
        return quarantinedSeedRows;
    }

    public void setQuarantinedSeedRows(int quarantinedSeedRows) {
        this.quarantinedSeedRows = quarantinedSeedRows;
    }

    public int getQueueSize() {
        return queueSize;
    }

    public void setQueueSize(int queueSize) {
        this.queueSize = queueSize;
    }

    public long getTotalMatches() {
        return totalMatches;
    }

    public void setTotalMatches(long totalMatches) {
        this.totalMatches = totalMatches;
    }

    public long getActiveStackDepth() {
        return activeStackDepth;
    }

    public void setActiveStackDepth(long activeStackDepth) {
        this.activeStackDepth = activeStackDepth;
    }

    public String getDatabaseEngine() {
        return databaseEngine;
    }

    public void setDatabaseEngine(String databaseEngine) {
        this.databaseEngine = databaseEngine;
    }
}
