package com.rankforge.service;

import com.rankforge.dto.LeaderboardEntryResponse;
import com.rankforge.model.Player;
import com.rankforge.repository.PlayerRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service producing ranked leaderboard standings.
 * Directly reuses and adapts the QuickSort Lomuto partitioning algorithm
 * from original academic `PlayerArray.java`:
 * - `leaderboardQuick()`
 * - `quickSort(int start, int end)`
 * - `partition(int start, int end)`
 *
 * Adaptation Enhancement:
 * Preserves the exact Lomuto end-element pivot mechanism while adding
 * deterministic equal-score tie-breaking using ascending Player ID.
 */
@Service
public class LeaderboardService {

    private final PlayerRepository playerRepository;

    public LeaderboardService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    /**
     * Produces ranked leaderboard entries sorted by score descending using QuickSort.
     *
     * @param teamFilter optional team affiliation filter (null or "all" for all teams)
     * @param limit optional maximum number of entries to return (0 or negative for all)
     * @return ranked leaderboard list with calculated rank indices (1..N)
     */
    public List<LeaderboardEntryResponse> getLeaderboard(String teamFilter, int limit) {
        List<Player> all = playerRepository.findAll();

        // 1. Optional filter by team
        List<Player> filtered = new ArrayList<>();
        for (Player p : all) {
            if (teamFilter == null || teamFilter.isBlank() || "all".equalsIgnoreCase(teamFilter)) {
                filtered.add(p);
            } else if (p.getTeam() != null && p.getTeam().equalsIgnoreCase(teamFilter.trim())) {
                filtered.add(p);
            }
        }

        // 2. Convert to array to execute original PlayerArray array-based QuickSort
        Player[] arr = filtered.toArray(new Player[0]);

        if (arr.length > 1) {
            quickSort(arr, 0, arr.length - 1);
        }

        // 3. Assemble ranked responses with sequential ranks
        int maxEntries = (limit > 0 && limit < arr.length) ? limit : arr.length;
        List<LeaderboardEntryResponse> results = new ArrayList<>(maxEntries);
        for (int i = 0; i < maxEntries; i++) {
            results.add(new LeaderboardEntryResponse(i + 1, arr[i]));
        }

        return results;
    }

    /**
     * Exact recursive QuickSort structure from PlayerArray.java:
     * void quickSort(int start, int end)
     */
    public void quickSort(Player[] arr, int start, int end) {
        if (start < end) {
            int pivotIndex = partition(arr, start, end);
            quickSort(arr, start, pivotIndex - 1);
            quickSort(arr, pivotIndex + 1, end);
        }
    }

    /**
     * Lomuto partitioning directly adapted from PlayerArray.java:
     * - Uses end element as pivot: arr[end]
     * - Sorts descending by score: arr[j].score > pivot.score
     * - Deterministic tie-breaking on equal score: arr[j].id < pivot.id ranks higher
     */
    public int partition(Player[] arr, int start, int end) {
        Player pivot = arr[end];
        int i = start - 1;

        for (int j = start; j < end; j++) {
            if (isHigherRanked(arr[j], pivot)) {
                i++;
                swap(arr, i, j);
            }
        }

        swap(arr, i + 1, end);
        return i + 1;
    }

    /**
     * Comparison logic:
     * 1. Higher score wins (descending order).
     * 2. On equal score, smaller ID wins (ascending ID deterministic tie-breaker).
     */
    public boolean isHigherRanked(Player a, Player b) {
        if (a.getScore() != b.getScore()) {
            return a.getScore() > b.getScore();
        }
        return a.getId() < b.getId();
    }

    private void swap(Player[] arr, int i, int j) {
        Player temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
