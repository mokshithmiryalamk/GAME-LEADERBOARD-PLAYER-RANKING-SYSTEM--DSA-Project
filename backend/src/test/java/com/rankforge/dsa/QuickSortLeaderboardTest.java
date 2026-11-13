package com.rankforge.dsa;

import com.rankforge.model.Player;
import com.rankforge.service.LeaderboardService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class QuickSortLeaderboardTest {

    private final LeaderboardService leaderboardService = new LeaderboardService(null);

    @Test
    public void testQuickSortSortsDescendingWithTieBreak() {
        Player p1 = new Player("Amit", 101, 80, 2);
        Player p2 = new Player("Rahul", 102, 90, 4);
        Player p3 = new Player("Neha", 103, 90, 3);
        Player p4 = new Player("Arjun", 104, 100, 5);
        Player p5 = new Player("Kiran", 105, 60, 2);

        Player[] arr = new Player[]{p1, p2, p3, p4, p5};

        leaderboardService.quickSort(arr, 0, arr.length - 1);

        assertEquals("Arjun", arr[0].getName());
        assertEquals(100, arr[0].getScore());

        // Ties on score 90 broken by ascending ID (102 before 103)
        assertEquals(102, arr[1].getId());
        assertEquals("Rahul", arr[1].getName());

        assertEquals(103, arr[2].getId());
        assertEquals("Neha", arr[2].getName());

        assertEquals(101, arr[3].getId());
        assertEquals(80, arr[3].getScore());

        assertEquals(105, arr[4].getId());
        assertEquals(60, arr[4].getScore());
    }

    @Test
    public void testQuickSortSingleAndEmpty() {
        Player[] single = new Player[]{new Player("Solo", 1, 50, 1)};
        leaderboardService.quickSort(single, 0, single.length - 1);
        assertEquals(1, single.length);
        assertEquals(50, single[0].getScore());
    }
}
