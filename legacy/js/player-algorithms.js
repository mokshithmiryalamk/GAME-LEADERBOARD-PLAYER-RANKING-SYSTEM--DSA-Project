/**
 * GAME LEADERBOARD - DSA SEARCH & RANKING ALGORITHMS
 * Mirroring Java implementations in `PlayerArray.java`:
 * 1. Linear Search by ID (O(N))
 * 2. Linear Search by Name (O(N))
 * 3. Linear Search by Team (O(N))
 * 4. Binary Search by ID (O(log N)) - Operates on a sorted snapshot preserving registry order
 * 5. Hash-Map Search by ID (O(1)) - Direct map lookup
 * 6. QuickSort Leaderboard (O(N log N)) - Lomuto partition with last element pivot, descending score
 */

(function (window) {
  'use strict';

  const PlayerAlgorithms = {

    /**
     * Linear Search by ID — Scans array from start to finish
     * Corresponds to `PlayerArray.linearSearchById(int id)`
     */
    linearSearchById: function (players, targetId) {
      const t0 = (typeof performance !== 'undefined') ? performance.now() : Date.now();
      const id = Number(targetId);
      let comparisons = 0;
      let matchedPlayer = null;
      let matchIndex = -1;

      for (let i = 0; i < players.length; i++) {
        comparisons++;
        if (players[i].id === id) {
          matchedPlayer = { ...players[i] };
          matchIndex = i;
          break;
        }
      }

      const t1 = (typeof performance !== 'undefined') ? performance.now() : Date.now();
      return {
        algorithm: 'Linear Search by ID',
        complexity: 'O(N)',
        targetId: id,
        found: matchedPlayer !== null,
        player: matchedPlayer,
        index: matchIndex,
        comparisons: comparisons,
        timeMs: Math.max(0.01, Number((t1 - t0).toFixed(3)))
      };
    },

    /**
     * Linear Search by Name — Case-insensitive lookup
     * Corresponds to `PlayerArray.linearSearchByName(String name)`
     */
    linearSearchByName: function (players, queryName) {
      const t0 = (typeof performance !== 'undefined') ? performance.now() : Date.now();
      const query = (queryName || '').trim().toLowerCase();
      let comparisons = 0;
      const matches = [];

      for (let i = 0; i < players.length; i++) {
        comparisons++;
        if (players[i].name.toLowerCase() === query) {
          matches.push({ ...players[i] });
        }
      }

      const t1 = (typeof performance !== 'undefined') ? performance.now() : Date.now();
      return {
        algorithm: 'Linear Search by Name',
        complexity: 'O(N)',
        query: queryName,
        found: matches.length > 0,
        matches: matches,
        comparisons: comparisons,
        timeMs: Math.max(0.01, Number((t1 - t0).toFixed(3)))
      };
    },

    /**
     * Linear Search by Team — Case-insensitive team filter
     * Corresponds to `PlayerArray.linearSearchByTeam(String team)`
     */
    linearSearchByTeam: function (players, targetTeam) {
      const t0 = (typeof performance !== 'undefined') ? performance.now() : Date.now();
      const query = (targetTeam || '').trim().toLowerCase();
      let comparisons = 0;
      const matches = [];

      const isSoloQuery = (query === 'solo' || query === 'noteam' || query === '-' || query === 'none');

      for (let i = 0; i < players.length; i++) {
        comparisons++;
        const pTeam = (players[i].team || '').trim().toLowerCase();
        const pIsSolo = (!players[i].team || pTeam === 'noteam' || pTeam === 'null' || pTeam === '-');

        if (isSoloQuery) {
          if (pIsSolo) matches.push({ ...players[i] });
        } else if (pTeam === query) {
          matches.push({ ...players[i] });
        }
      }

      const t1 = (typeof performance !== 'undefined') ? performance.now() : Date.now();
      return {
        algorithm: 'Linear Search by Team',
        complexity: 'O(N)',
        query: targetTeam,
        found: matches.length > 0,
        matches: matches,
        comparisons: comparisons,
        timeMs: Math.max(0.01, Number((t1 - t0).toFixed(3)))
      };
    },

    /**
     * Binary Search by ID — Operates on a sorted snapshot
     * Corresponds to `PlayerArray.binarySearchById(int id)` + `sortById()`
     * IMPORTANT: Operates on a cloned array so the canonical registry order is preserved!
     */
    binarySearchById: function (players, targetId) {
      const t0 = (typeof performance !== 'undefined') ? performance.now() : Date.now();
      const id = Number(targetId);

      // Create a sorted snapshot copy by ID ascending
      const sortedSnapshot = players.map(p => ({ ...p })).sort((a, b) => a.id - b.id);

      let low = 0;
      let high = sortedSnapshot.length - 1;
      let comparisons = 0;
      let matchedPlayer = null;
      let matchIndex = -1;
      const traceSteps = [];

      while (low <= high) {
        comparisons++;
        const mid = Math.floor((low + high) / 2);
        const midVal = sortedSnapshot[mid].id;

        traceSteps.push({
          step: traceSteps.length + 1,
          low: low,
          mid: mid,
          high: high,
          midId: midVal,
          targetId: id
        });

        if (midVal === id) {
          matchedPlayer = { ...sortedSnapshot[mid] };
          matchIndex = mid;
          break;
        } else if (midVal < id) {
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      const t1 = (typeof performance !== 'undefined') ? performance.now() : Date.now();
      return {
        algorithm: 'Binary Search by ID',
        complexity: 'O(log N)',
        targetId: id,
        found: matchedPlayer !== null,
        player: matchedPlayer,
        indexInSortedSnapshot: matchIndex,
        comparisons: comparisons,
        steps: traceSteps,
        timeMs: Math.max(0.01, Number((t1 - t0).toFixed(3)))
      };
    },

    /**
     * Hash Map Search by ID — Direct map lookup
     * Corresponds to `PlayerArray.searchByIdHash(int id)`
     */
    hashMapSearchById: function (playerMap, targetId) {
      const t0 = (typeof performance !== 'undefined') ? performance.now() : Date.now();
      const id = Number(targetId);
      const player = (playerMap && typeof playerMap.get === 'function') ? playerMap.get(id) : (playerMap ? playerMap[id] : null);
      const t1 = (typeof performance !== 'undefined') ? performance.now() : Date.now();

      return {
        algorithm: 'Hash-Map Search by ID',
        complexity: 'O(1)',
        targetId: id,
        found: Boolean(player),
        player: player ? { ...player } : null,
        comparisons: 1, // Single bucket evaluation
        timeMs: Math.max(0.01, Number((t1 - t0).toFixed(3)))
      };
    },

    /**
     * QuickSort Leaderboard — Descending score sorting with Lomuto partitioning
     * Strictly mirrors `PlayerArray.leaderboardQuick()`, `quickSort()`, and `partition()`
     * Uses last element as pivot: pivot = players[end].score
     * Enhancement: Deterministic tie-breaking on equal score using player ID ascending
     */
    quickSortLeaderboard: function (players) {
      if (!Array.isArray(players) || players.length === 0) {
        return [];
      }

      // Clone array to prevent mutating canonical registry order
      const list = players.map(p => ({ ...p }));

      function partition(start, end) {
        const pivotScore = list[end].score;
        const pivotId = list[end].id;
        let i = start - 1;

        for (let j = start; j < end; j++) {
          // Compare descending: higher score comes first
          let shouldSwap = false;
          if (list[j].score > pivotScore) {
            shouldSwap = true;
          } else if (list[j].score === pivotScore) {
            // Deterministic tie policy: smaller ID ranks higher
            if (list[j].id < pivotId) {
              shouldSwap = true;
            }
          }

          if (shouldSwap) {
            i++;
            const temp = list[i];
            list[i] = list[j];
            list[j] = temp;
          }
        }

        const temp = list[i + 1];
        list[i + 1] = list[end];
        list[end] = temp;
        return i + 1;
      }

      function quickSort(start, end) {
        if (start < end) {
          const pivotIndex = partition(start, end);
          quickSort(start, pivotIndex - 1);
          quickSort(pivotIndex + 1, end);
        }
      }

      quickSort(0, list.length - 1);

      // Assign 1-based ranks
      return list.map((p, idx) => ({
        ...p,
        rank: idx + 1
      }));
    }
  };

  window.GamePlayerAlgorithms = PlayerAlgorithms;

})(typeof window !== 'undefined' ? window : global);
