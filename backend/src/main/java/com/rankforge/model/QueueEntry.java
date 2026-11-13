package com.rankforge.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Persistent representation of an active contender in the circular matchmaking queue.
 */
@Entity
@Table(name = "matchmaking_queue")
public class QueueEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "player_id", nullable = false, unique = true)
    private Player player;

    @Column(name = "slot_index", nullable = false)
    private int slotIndex;

    @Column(name = "enqueued_at", nullable = false)
    private Instant enqueuedAt = Instant.now();

    public QueueEntry() {
        this.enqueuedAt = Instant.now();
    }

    public QueueEntry(Player player, int slotIndex) {
        this.player = player;
        this.slotIndex = slotIndex;
        this.enqueuedAt = Instant.now();
    }

    public QueueEntry(Player player, int slotIndex, Instant enqueuedAt) {
        this.player = player;
        this.slotIndex = slotIndex;
        this.enqueuedAt = (enqueuedAt != null) ? enqueuedAt : Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public int getSlotIndex() {
        return slotIndex;
    }

    public void setSlotIndex(int slotIndex) {
        this.slotIndex = slotIndex;
    }

    public Instant getEnqueuedAt() {
        return enqueuedAt;
    }

    public void setEnqueuedAt(Instant enqueuedAt) {
        this.enqueuedAt = enqueuedAt;
    }
}
