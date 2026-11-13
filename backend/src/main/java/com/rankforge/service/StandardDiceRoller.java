package com.rankforge.service;

import org.springframework.stereotype.Component;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Standard dice roller generating stochastic integers 1..100.
 */
@Component
public class StandardDiceRoller implements DiceRoller {

    @Override
    public int roll() {
        return ThreadLocalRandom.current().nextInt(1, 101);
    }
}
