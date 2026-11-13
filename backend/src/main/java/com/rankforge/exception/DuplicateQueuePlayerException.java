package com.rankforge.exception;

public class DuplicateQueuePlayerException extends RuntimeException {
    public DuplicateQueuePlayerException(int id) {
        super("Player #" + id + " is already waiting in the matchmaking lobby.");
    }

    public DuplicateQueuePlayerException(String message) {
        super(message);
    }
}
