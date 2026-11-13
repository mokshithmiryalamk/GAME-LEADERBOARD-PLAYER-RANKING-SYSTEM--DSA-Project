package com.rankforge.exception;

public class InsufficientQueuePlayersException extends RuntimeException {
    public InsufficientQueuePlayersException(String message) {
        super(message);
    }
}
