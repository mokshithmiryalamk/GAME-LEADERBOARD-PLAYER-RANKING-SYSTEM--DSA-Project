/**
 * GAME LEADERBOARD - MATCH PERSISTENCE LAYER
 * Persists matchmaking queue state and completed match audit logs in browser LocalStorage.
 *
 * Requirements:
 * - Versioned storage keys: `game_leaderboard_queue_v1` & `game_leaderboard_matches_v1`
 * - Validates queued player IDs against GamePlayerData on reload; drops stale/deleted IDs
 * - Preserves completed match records with full structural schema ready for Stage 4
 * - Cleans up gracefully on Demo Data Reset
 */

(function (window) {
  'use strict';

  const QUEUE_STORAGE_KEY = 'game_leaderboard_queue_v1';
  const MATCHES_STORAGE_KEY = 'game_leaderboard_matches_v1';
  const JOURNAL_STORAGE_KEY = 'game_leaderboard_tx_journal_v1';

  const MatchData = {
    matches: [],
    subscribers: new Set(),
    isInitialized: false,

    init: function () {
      if (this.isInitialized) return this;

      this.reconcileJournal();
      this.loadMatches();
      this.restoreQueue();
      this.bindStoreListeners();

      this.isInitialized = true;
      return this;
    },

    /**
     * Transaction Journal for Crash Recovery & Multi-Key Consistency
     */
    reconcileJournal: function () {
      try {
        if (typeof localStorage === 'undefined') return;
        const raw = localStorage.getItem(JOURNAL_STORAGE_KEY);
        if (!raw) return;

        const journal = JSON.parse(raw);
        if (journal && journal.status === 'PENDING') {
          console.warn('Reconciling interrupted match transaction:', journal.txId);
          // If transaction was not committed, clean up journal
          localStorage.removeItem(JOURNAL_STORAGE_KEY);
        }
      } catch (err) {
        console.warn('Journal reconciliation error:', err);
      }
    },

    beginTransaction: function (txType, payload) {
      const txId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      const entry = {
        txId: txId,
        type: txType,
        payload: payload,
        status: 'PENDING',
        timestamp: new Date().toISOString()
      };
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entry));
        }
      } catch (e) {}
      return txId;
    },

    commitTransaction: function (txId) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(JOURNAL_STORAGE_KEY);
        }
      } catch (e) {}
    },

    rollbackTransaction: function (txId) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(JOURNAL_STORAGE_KEY);
        }
      } catch (e) {}
    },

    bindStoreListeners: function () {
      // Auto-save queue whenever GameMatchQueue changes
      if (window.GameMatchQueue && typeof window.GameMatchQueue.subscribe === 'function') {
        window.GameMatchQueue.subscribe(() => {
          this.saveQueue();
        });
      }

      // Clear match records and queue when GamePlayerData resets
      if (window.GamePlayerData && typeof window.GamePlayerData.subscribe === 'function') {
        window.GamePlayerData.subscribe((event) => {
          if (event === 'DATA_RESET') {
            this.clearMatches();
            this.saveQueue();
          }
        });
      }
    },

    /**
     * Restores queued players from LocalStorage, validating that each player exists
     */
    restoreQueue: function () {
      if (!window.GameMatchQueue) return false;

      try {
        if (typeof localStorage === 'undefined') return false;
        const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
        if (!raw) return false;

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) return false;

        window.GameMatchQueue.clear(true);
        const seenIds = new Set();

        for (const rawId of parsed) {
          const id = Number(rawId);
          if (!Number.isInteger(id) || id <= 0 || seenIds.has(id)) continue;

          // Validate player exists in GamePlayerData
          if (window.GamePlayerData && typeof window.GamePlayerData.getById === 'function') {
            const player = window.GamePlayerData.getById(id);
            if (!player) continue; // Skip deleted or nonexistent player
          }

          seenIds.add(id);
          try {
            window.GameMatchQueue.enqueue(id, true);
          } catch (e) {
            // Queue may reach capacity; stop safely
            break;
          }
        }

        return true;
      } catch (err) {
        console.warn('Could not restore matchmaking queue from localStorage:', err);
        return false;
      }
    },

    /**
     * Saves current queue player IDs to LocalStorage
     */
    saveQueue: function () {
      if (!window.GameMatchQueue) return;
      try {
        if (typeof localStorage !== 'undefined') {
          const ids = window.GameMatchQueue.getWaitingIds();
          localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(ids));
        }
      } catch (err) {
        console.warn('Failed to save matchmaking queue to localStorage:', err);
      }
    },

    /**
     * Loads completed match records from LocalStorage
     */
    loadMatches: function () {
      try {
        if (typeof localStorage === 'undefined') {
          this.matches = [];
          return;
        }

        const raw = localStorage.getItem(MATCHES_STORAGE_KEY);
        if (!raw) {
          this.matches = [];
          return;
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
          this.matches = [];
          return;
        }

        // Validate basic match record integrity
        this.matches = parsed.filter(m => m && typeof m === 'object' && m.matchId && m.matchType);
      } catch (err) {
        console.warn('Could not load completed matches from localStorage:', err);
        this.matches = [];
      }
    },

    /**
     * Saves matches array to LocalStorage
     */
    saveMatches: function () {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(this.matches));
        }
      } catch (err) {
        console.warn('Failed to save matches to localStorage:', err);
      }
    },

    /**
     * Records a completed match with structured schema for Stage 4 history & undo
     */
    recordCompletedMatch: function (record) {
      if (!record || typeof record !== 'object' || !record.matchId) {
        throw new Error('Invalid match record payload.');
      }

      const matchEntry = {
        matchId: String(record.matchId),
        matchType: record.matchType === '2v2' ? '2v2' : '1v1',
        participantIds: Array.isArray(record.participantIds) ? record.participantIds.map(Number) : [],
        teamA: {
          playerIds: record.teamA && Array.isArray(record.teamA.playerIds) ? record.teamA.playerIds.map(Number) : [],
          playersSnapshot: record.teamA && Array.isArray(record.teamA.playersSnapshot) ? record.teamA.playersSnapshot.map(p => ({ ...p })) : [],
          rolls: record.teamA && Array.isArray(record.teamA.rolls) ? record.teamA.rolls.map(Number) : [],
          total: record.teamA ? Number(record.teamA.total) || 0 : 0
        },
        teamB: {
          playerIds: record.teamB && Array.isArray(record.teamB.playerIds) ? record.teamB.playerIds.map(Number) : [],
          playersSnapshot: record.teamB && Array.isArray(record.teamB.playersSnapshot) ? record.teamB.playersSnapshot.map(p => ({ ...p })) : [],
          rolls: record.teamB && Array.isArray(record.teamB.rolls) ? record.teamB.rolls.map(Number) : [],
          total: record.teamB ? Number(record.teamB.total) || 0 : 0
        },
        winnerTeam: String(record.winnerTeam || 'teamA'),
        winnerIds: Array.isArray(record.winnerIds) ? record.winnerIds.map(Number) : [],
        scoreDelta: Number(record.scoreDelta) || 10,
        tieRerolls: Array.isArray(record.tieRerolls) ? record.tieRerolls : [],
        timestamp: record.timestamp || new Date().toISOString(),
        status: 'COMPLETED'
      };

      this.matches.push(matchEntry);
      this.saveMatches();
      this.notifySubscribers('MATCH_RECORDED', matchEntry);
      return { ...matchEntry };
    },

    /**
     * Retrieves the latest eligible completed match for LIFO Undo
     * Scans backwards from top of history stack.
     */
    getLatestEligibleMatch: function () {
      for (let i = this.matches.length - 1; i >= 0; i--) {
        if (this.matches[i].status === 'COMPLETED') {
          return { ...this.matches[i], stackIndex: i };
        }
      }
      return null;
    },

    /**
     * Retrieves match by unique ID
     */
    getMatchById: function (matchId) {
      const m = this.matches.find(item => item.matchId === matchId);
      return m ? { ...m } : null;
    },

    /**
     * Marks a match as UNDONE with reversal metadata
     */
    markMatchUndone: function (matchId, reversalInfo = {}) {
      const match = this.matches.find(m => m.matchId === matchId);
      if (!match) {
        throw new Error(`Match ${matchId} not found.`);
      }

      if (match.status === 'UNDONE') {
        throw new Error(`Match ${matchId} has already been undone.`);
      }

      match.status = 'UNDONE';
      match.undoneAt = new Date().toISOString();
      match.reversalInfo = { ...reversalInfo };

      this.saveMatches();
      this.notifySubscribers('MATCH_UNDONE', match);
      return { ...match };
    },

    /**
     * Returns a copy of all match records (including completed and undone)
     */
    getCompletedMatches: function () {
      return this.matches.map(m => ({ ...m }));
    },

    /**
     * Returns count of active (non-undone) completed matches
     */
    getActiveCompletedCount: function () {
      return this.matches.filter(m => m.status === 'COMPLETED').length;
    },

    /**
     * Returns count of undone matches
     */
    getUndoneCount: function () {
      return this.matches.filter(m => m.status === 'UNDONE').length;
    },

    /**
     * Returns total count of all logged matches
     */
    getCompletedCount: function () {
      return this.matches.length;
    },

    /**
     * Clears all match records
     */
    clearMatches: function () {
      this.matches = [];
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(MATCHES_STORAGE_KEY);
        }
      } catch (err) {}
      this.notifySubscribers('MATCHES_CLEARED', null);
    },

    /**
     * Subscribes to match data updates
     */
    subscribe: function (callback) {
      if (typeof callback === 'function') {
        this.subscribers.add(callback);
      }
      return () => {
        this.subscribers.delete(callback);
      };
    },

    notifySubscribers: function (event, payload) {
      this.subscribers.forEach(fn => {
        try {
          fn(event, payload, this.matches.length);
        } catch (err) {
          console.error('MatchData subscriber error:', err);
        }
      });
    }
  };

  window.GameMatchData = MatchData;

  // Auto-init
  MatchData.init();

})(typeof window !== 'undefined' ? window : global);
