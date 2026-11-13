package com.rankforge.exception;

/**
 * Exception thrown when a requested Player ID does not exist in the repository.
 */
public class PlayerNotFoundException extends RuntimeException {

    public PlayerNotFoundException(int id) {
        super("Player #" + id + " does not exist in the RANKFORGE registry.");
    }

    public PlayerNotFoundException(String message) {
        super(message);
    }
}
