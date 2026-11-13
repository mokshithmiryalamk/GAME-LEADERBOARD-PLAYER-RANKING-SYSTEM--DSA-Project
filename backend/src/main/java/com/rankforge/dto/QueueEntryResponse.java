package com.rankforge.dto;

import com.rankforge.model.Player;
import java.time.Instant;

/**
 * DTO representing an entry in the circular matchmaking queue.
 */
public class QueueEntryResponse {

    private int position; // 1-based FIFO position
    private int slotIndex; // circular buffer slot (0..49)
    private Player player;
    private Instant enqueuedAt;

    public QueueEntryResponse() {
    }

    public QueueEntryResponse(int position, int slotIndex, Player player, Instant enqueuedAt) {
        this.position = position;
        this.slotIndex = slotIndex;
        this.player = player;
        this.enqueuedAt = enqueuedAt;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }

    public int getSlotIndex() {
        return slotIndex;
    }

    public void setSlotIndex(int slotIndex) {
        this.slotIndex = slotIndex;
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public Instant getEnqueuedAt() {
        return enqueuedAt;
    }

    public void setEnqueuedAt(Instant enqueuedAt) {
        this.enqueuedAt = enqueuedAt;
    }
}
