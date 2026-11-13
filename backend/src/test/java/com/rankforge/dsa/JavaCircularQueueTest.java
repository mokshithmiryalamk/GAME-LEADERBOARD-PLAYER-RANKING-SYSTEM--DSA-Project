package com.rankforge.dsa;

import com.rankforge.model.Player;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit test suite verifying the genuine JavaCircularQueue DSA implementation.
 * Tests circular modulo wrap-around, FIFO order, capacity limits, and duplicate protection.
 */
public class JavaCircularQueueTest {

    private JavaCircularQueue queue;

    @BeforeEach
    public void setUp() {
        queue = new JavaCircularQueue(50);
    }

    @Test
    public void testInitialQueueState() {
        assertTrue(queue.isEmpty());
        assertFalse(queue.isFull());
        assertEquals(0, queue.size());
        assertEquals(50, queue.getCapacity());
        assertFalse(queue.hasTwoPlayers());
        assertFalse(queue.hasFourPlayers());
    }

    @Test
    public void testEnqueueAndFifoDequeue() {
        Player p1 = new Player("PlayerOne", 101, 5);
        Player p2 = new Player("PlayerTwo", 102, 5);
        Player p3 = new Player("PlayerThree", 103, 5);

        int slot0 = queue.enqueue(p1);
        int slot1 = queue.enqueue(p2);
        int slot2 = queue.enqueue(p3);

        assertEquals(0, slot0);
        assertEquals(1, slot1);
        assertEquals(2, slot2);
        assertEquals(3, queue.size());
        assertTrue(queue.hasTwoPlayers());

        Player d1 = queue.dequeue();
        assertEquals(101, d1.getId());
        assertEquals(2, queue.size());

        Player d2 = queue.dequeue();
        assertEquals(102, d2.getId());
        assertEquals(1, queue.size());

        Player d3 = queue.dequeue();
        assertEquals(103, d3.getId());
        assertTrue(queue.isEmpty());
    }

    @Test
    public void testCircularModuloWraparoundPreventsArrayExhaustion() {
        // In the original PlayerQueue.java flaw, after 50 lifetime enqueues the array overflowed.
        // Here we run 200 consecutive enqueue/dequeue cycles on capacity 5 to verify wraparound!
        JavaCircularQueue miniQueue = new JavaCircularQueue(5);

        for (int i = 0; i < 200; i++) {
            Player p = new Player("Player" + i, i + 1, 1);
            miniQueue.enqueue(p);
            assertEquals(1, miniQueue.size());

            Player dequeued = miniQueue.dequeue();
            assertEquals(i + 1, dequeued.getId());
            assertEquals(0, miniQueue.size());
            assertTrue(miniQueue.isEmpty());
        }

        // Verify pointers wrapped around smoothly
        assertEquals(0, miniQueue.size());
    }

    @Test
    public void testCapacityExceededThrowsException() {
        JavaCircularQueue smallQueue = new JavaCircularQueue(3);
        smallQueue.enqueue(new Player("P1", 1, 1));
        smallQueue.enqueue(new Player("P2", 2, 1));
        smallQueue.enqueue(new Player("P3", 3, 1));

        assertTrue(smallQueue.isFull());
        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                smallQueue.enqueue(new Player("P4", 4, 1))
        );
        assertTrue(ex.getMessage().contains("maximum capacity"));
    }

    @Test
    public void testDuplicatePlayerRejection() {
        Player p1 = new Player("Arjun", 104, 5);
        queue.enqueue(p1);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                queue.enqueue(new Player("ArjunDuplicate", 104, 5))
        );
        assertTrue(ex.getMessage().contains("already in the matchmaking lobby"));
    }

    @Test
    public void testRemoveByIdPreservesOrder() {
        Player p1 = new Player("P1", 1, 1);
        Player p2 = new Player("P2", 2, 1);
        Player p3 = new Player("P3", 3, 1);

        queue.enqueue(p1);
        queue.enqueue(p2);
        queue.enqueue(p3);

        boolean removed = queue.removeById(2);
        assertTrue(removed);
        assertEquals(2, queue.size());

        List<Player> remaining = queue.toList();
        assertEquals(2, remaining.size());
        assertEquals(1, remaining.get(0).getId());
        assertEquals(3, remaining.get(1).getId());
    }

    @Test
    public void testDequeueOnEmptyQueueThrowsException() {
        assertThrows(IllegalStateException.class, () -> queue.dequeue());
    }
}
