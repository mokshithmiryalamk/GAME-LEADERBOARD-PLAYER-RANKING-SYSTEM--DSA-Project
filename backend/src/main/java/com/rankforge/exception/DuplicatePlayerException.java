package com.rankforge.exception;

public class DuplicatePlayerException extends RuntimeException {
    public DuplicatePlayerException(int id) {
        super("Player #" + id + " already exists in the RANKFORGE registry.");
    }

    public DuplicatePlayerException(String message) {
        super(message);
    }
}
