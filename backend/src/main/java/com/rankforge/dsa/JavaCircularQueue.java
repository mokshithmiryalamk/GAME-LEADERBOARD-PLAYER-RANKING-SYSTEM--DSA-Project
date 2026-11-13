package com.rankforge.dsa;

import com.rankforge.model.Player;
import java.util.ArrayList;
import java.util.List;

/**
 * Genuine Java DSA Circular Queue implementation directly adapting original-source/PlayerQueue.java.
 *
 * Flaw Resolution:
 * In the original academic implementation (PlayerQueue.java lines 25 and 41),
 * pointers incremented linearly without modulo wrap-around (rear++ on enqueue, front++ on dequeue),
 * which permanently exhausted the array after 50 lifetime matches even when the queue was empty.
 *
 * This class implements authentic circular buffer wrap-around with constant capacity (50):
 * rear = (rear + 1) % capacity
 * front = (front + 1) % capacity
 */
public class JavaCircularQueue {

    public static final int DEFAULT_CAPACITY = 50;

    private final int capacity;
    private final Player[] elements;
    private int front;
    private int rear;
    private int size;

    public JavaCircularQueue() {
        this(DEFAULT_CAPACITY);
    }

    public JavaCircularQueue(int capacity) {
        this.capacity = capacity;
        this.elements = new Player[capacity];
        this.front = 0;
        this.rear = -1;
        this.size = 0;
    }

    public synchronized boolean isFull() {
        return size == capacity;
    }

    public synchronized boolean isEmpty() {
        return size == 0;
    }

    public synchronized int size() {
        return size;
    }

    public synchronized int getCapacity() {
        return capacity;
    }

    public synchronized int getFront() {
        return front;
    }

    public synchronized int getRear() {
        return rear;
    }

    /**
     * Enqueues a player into the matchmaking queue using modulo wrap-around.
     * @param p Contender to enqueue
     * @return Circular slot index where the player was placed
     */
    public synchronized int enqueue(Player p) {
        if (isFull()) {
            throw new IllegalStateException("Matchmaking lobby is at maximum capacity (50 players).");
        }
        if (p == null) {
            throw new IllegalArgumentException("Cannot enqueue null player.");
        }
        if (containsPlayer(p.getId())) {
            throw new IllegalArgumentException("Player #" + p.getId() + " is already in the matchmaking lobby.");
        }

        rear = (rear + 1) % capacity;
        elements[rear] = p;
        size++;

        return rear;
    }

    /**
     * Dequeues the frontmost contender in FIFO order using modulo wrap-around.
     * @return The dequeued contender
     */
    public synchronized Player dequeue() {
        if (isEmpty()) {
            throw new IllegalStateException("No players waiting in the matchmaking lobby.");
        }

        Player p = elements[front];
        elements[front] = null;
        front = (front + 1) % capacity;
        size--;

        if (size == 0) {
            front = 0;
            rear = -1;
        }

        return p;
    }

    /**
     * Removes a player by ID from anywhere in the queue (e.g. Leave Lobby),
     * maintaining FIFO order for all remaining players.
     */
    public synchronized boolean removeById(int playerId) {
        if (isEmpty() || !containsPlayer(playerId)) {
            return false;
        }

        Player[] temp = new Player[capacity];
        int newSize = 0;

        for (int i = 0; i < size; i++) {
            int idx = (front + i) % capacity;
            if (elements[idx] != null && elements[idx].getId() != playerId) {
                temp[newSize++] = elements[idx];
            }
        }

        for (int i = 0; i < capacity; i++) {
            elements[i] = (i < newSize) ? temp[i] : null;
        }

        front = 0;
        rear = newSize - 1;
        size = newSize;

        return true;
    }

    public synchronized boolean containsPlayer(int playerId) {
        for (int i = 0; i < size; i++) {
            int idx = (front + i) % capacity;
            if (elements[idx] != null && elements[idx].getId() == playerId) {
                return true;
            }
        }
        return false;
    }

    public synchronized List<Player> toList() {
        List<Player> list = new ArrayList<>(size);
        for (int i = 0; i < size; i++) {
            int idx = (front + i) % capacity;
            if (elements[idx] != null) {
                list.add(elements[idx]);
            }
        }
        return list;
    }

    public synchronized void clear() {
        for (int i = 0; i < capacity; i++) {
            elements[i] = null;
        }
        front = 0;
        rear = -1;
        size = 0;
    }

    public synchronized boolean hasTwoPlayers() {
        return size >= 2;
    }

    public synchronized boolean hasFourPlayers() {
        return size >= 4;
    }
}
