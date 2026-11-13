package com.rankforge.service;

/**
 * Pluggable dice roller abstraction modeling original-source/Main.java rollNumber().
 * Supports dependency injection for deterministic automated tests and stochastic production play.
 */
@FunctionalInterface
public interface DiceRoller {
    /**
     * Rolls a dice producing an integer between 1 and 100 inclusive.
     */
    int roll();
}
