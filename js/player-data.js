/**
 * GAME LEADERBOARD - CENTRAL PLAYER DATA STORE
 * Manages player state, validation, LocalStorage persistence, and change subscriptions.
 * Mirrors Java `PlayerArray` & `Player` class semantics with modern reactive pub-sub.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'game_leaderboard_players_v1';

  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const PlayerStore = {
    players: [],
    playerMap: new Map(),
    subscribers: new Set(),
    isInitialized: false,

    /**
     * Initializes the player store from localStorage or default seed data
     */
    init: function () {
      if (this.isInitialized) return this;

      const loaded = this.loadFromStorage();
      if (!loaded || this.players.length === 0) {
        this.resetDemoData(false);
      } else {
        this.rebuildIndexMap();
      }

      this.isInitialized = true;
      return this;
    },

    /**
     * Rebuilds the internal O(1) ID-to-player hash map
     */
    rebuildIndexMap: function () {
      this.playerMap.clear();
      for (let i = 0; i < this.players.length; i++) {
        this.playerMap.set(this.players[i].id, this.players[i]);
      }
    },

    /**
     * Loads saved players from browser LocalStorage
     */
    loadFromStorage: function () {
      try {
        if (typeof localStorage === 'undefined') return false;
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) return false;

        // Validate each loaded record
        const validated = [];
        const seenIds = new Set();

        for (const item of parsed) {
          const validation = this.validatePlayerData(item, true);
          if (validation.valid && !seenIds.has(item.id)) {
            seenIds.add(item.id);
            validated.push({
              id: item.id,
              name: item.name.trim(),
              score: Math.max(0, Number(item.score) || 0),
              level: Number(item.level),
              team: this.normalizeTeam(item.team),
              createdAt: item.createdAt || new Date().toISOString()
            });
          }
        }

        if (validated.length === 0) return false;

        this.players = validated;
        this.rebuildIndexMap();
        return true;
      } catch (err) {
        console.warn('Could not restore players from localStorage, falling back to seed data:', err);
        return false;
      }
    },

    /**
     * Persists current players array to browser LocalStorage
     */
    saveToStorage: function () {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.players));
        }
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }
    },

    /**
     * Normalizes team strings (NoTeam / null / '-' -> 'NoTeam')
     */
    normalizeTeam: function (team) {
      if (!team) return 'NoTeam';
      const trimmed = team.trim();
      if (!trimmed || trimmed.toLowerCase() === 'noteam' || trimmed === '-' || trimmed === 'null') {
        return 'NoTeam';
      }
      // Standardize casing for known teams
      if (trimmed.toLowerCase() === 'klh') return 'KLH';
      if (trimmed.toLowerCase() === 'warriors') return 'Warriors';
      if (trimmed.toLowerCase() === 'knights') return 'Knights';
      if (trimmed.toLowerCase() === 'dragons') return 'Dragons';
      return trimmed;
    },

    /**
     * Validates a player object according to domain rules
     */
    validatePlayerData: function (data, isExisting = false) {
      if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Player payload must be a valid object.' };
      }

      // 1. ID Validation
      const id = Number(data.id);
      if (!Number.isInteger(id) || id <= 0) {
        return { valid: false, error: 'Player ID must be a positive integer greater than 0.' };
      }

      if (!isExisting && this.playerMap.has(id)) {
        return { valid: false, error: `Player ID ${id} is already registered. IDs must be unique.` };
      }

      // 2. Name Validation
      if (typeof data.name !== 'string' || !data.name.trim()) {
        return { valid: false, error: 'Player name is required and cannot be blank.' };
      }
      const trimmedName = data.name.trim();
      if (trimmedName.length > 40) {
        return { valid: false, error: 'Player name must not exceed 40 characters.' };
      }

      // 3. Level Validation
      const level = Number(data.level);
      if (!Number.isInteger(level) || level < 1 || level > 999) {
        return { valid: false, error: 'Player level must be an integer between 1 and 999.' };
      }

      // 4. Score Validation (optional on creation; defaults to 0)
      if (data.score !== undefined && data.score !== null) {
        const score = Number(data.score);
        if (!Number.isInteger(score) || score < 0) {
          return { valid: false, error: 'Player score must be a non-negative integer (>= 0).' };
        }
      }

      return { valid: true, error: null };
    },

    /**
     * Retrieves all players (deep copy to protect internal state)
     */
    getAll: function () {
      return this.players.map(p => ({ ...p }));
    },

    /**
     * Retrieves a single player by ID
     */
    getById: function (id) {
      const p = this.playerMap.get(Number(id));
      return p ? { ...p } : null;
    },

    /**
     * Adds a new player to the registry
     * Score initializes to 0 matching Java constructor `Player(name, id, level)`
     */
    add: function (playerData) {
      const validation = this.validatePlayerData(playerData, false);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const id = Number(playerData.id);
      const name = playerData.name.trim();
      const level = Number(playerData.level);
      const score = (playerData.score !== undefined && playerData.score !== null)
        ? Math.max(0, Number(playerData.score))
        : 0; // Starts at 0 for new players per Java constructor
      const team = this.normalizeTeam(playerData.team);

      const newPlayer = {
        id: id,
        name: name,
        level: level,
        score: score,
        team: team,
        createdAt: new Date().toISOString()
      };

      this.players.push(newPlayer);
      this.playerMap.set(id, newPlayer);
      this.saveToStorage();
      this.notifySubscribers('PLAYER_ADDED', newPlayer);

      return { ...newPlayer };
    },

    /**
     * Updates an existing player's mutable attributes
     * ID cannot be mutated! Score is preserved.
     */
    update: function (id, updates) {
      const targetId = Number(id);
      const player = this.playerMap.get(targetId);
      if (!player) {
        throw new Error(`Player with ID ${targetId} not found.`);
      }

      if (updates.id !== undefined && Number(updates.id) !== targetId) {
        throw new Error('Player ID cannot be modified after registration.');
      }

      if (updates.name !== undefined) {
        if (typeof updates.name !== 'string' || !updates.name.trim()) {
          throw new Error('Player name cannot be blank.');
        }
        player.name = updates.name.trim();
      }

      if (updates.level !== undefined) {
        const lvl = Number(updates.level);
        if (!Number.isInteger(lvl) || lvl < 1 || lvl > 999) {
          throw new Error('Player level must be between 1 and 999.');
        }
        player.level = lvl;
      }

      if (updates.team !== undefined) {
        player.team = this.normalizeTeam(updates.team);
      }

      // If score is explicitly updated through score adjustment
      if (updates.score !== undefined) {
        const sc = Number(updates.score);
        if (!Number.isInteger(sc) || sc < 0) {
          throw new Error('Score must be a non-negative integer.');
        }
        player.score = sc;
      }

      this.saveToStorage();
      this.notifySubscribers('PLAYER_UPDATED', player);
      return { ...player };
    },

    /**
     * Deletes a player from the registry by ID
     */
    delete: function (id) {
      const targetId = Number(id);
      const idx = this.players.findIndex(p => p.id === targetId);
      if (idx === -1) {
        throw new Error(`Player #${targetId} does not exist in registry.`);
      }

      // Check referential integrity with pending undos if MatchUndo is available
      if (window.GameMatchUndo && typeof window.GameMatchUndo.canSafelyDeletePlayer === 'function') {
        const check = window.GameMatchUndo.canSafelyDeletePlayer(targetId);
        if (!check.safe) {
          throw new Error(check.reason);
        }
      }

      const removed = this.players.splice(idx, 1)[0];
      this.playerMap.delete(targetId);
      this.saveToStorage();
      this.notifySubscribers('PLAYER_DELETED', removed);
      return true;
    },

    /**
     * Atomic score award transaction for 1v1 and 2v2 match completions
     * Guarantees all-or-nothing execution: validates all winners before modifying any score.
     */
    applyMatchScoreAward: function (winnerIds, deltaPoints = 10, matchRecord = null) {
      if (!Array.isArray(winnerIds) || winnerIds.length === 0) {
        throw new Error('Winner IDs must be a non-empty array.');
      }

      const delta = Number(deltaPoints);
      if (!Number.isInteger(delta) || delta <= 0) {
        throw new Error('Score delta must be a positive integer.');
      }

      // Step 1: Pre-validate all target players exist
      const targetPlayers = [];
      for (let i = 0; i < winnerIds.length; i++) {
        const id = Number(winnerIds[i]);
        const player = this.playerMap.get(id);
        if (!player) {
          throw new Error(`Cannot award score: Player #${id} does not exist in registry.`);
        }
        targetPlayers.push(player);
      }

      // Step 2: Atomic update
      const updatedClones = [];
      for (let i = 0; i < targetPlayers.length; i++) {
        const p = targetPlayers[i];
        p.score = Math.max(0, p.score + delta);
        updatedClones.push({ ...p });
      }

      this.saveToStorage();
      this.notifySubscribers('MATCH_SCORES_AWARDED', {
        winnerIds: winnerIds.map(Number),
        deltaPoints: delta,
        updatedPlayers: updatedClones,
        matchRecord: matchRecord ? { ...matchRecord } : null
      });

      return updatedClones;
    },

    /**
     * Atomic score reversal transaction for Stage 4 Match Undo
     * Fixes Bug A (Java double deduction) and Bug B (Java partial 2v2 undo).
     * Reverses exactly the awarded delta (10) for all winning players simultaneously.
     */
    applyMatchScoreReversal: function (winnerIds, deltaPoints = 10, matchRecord = null) {
      if (!Array.isArray(winnerIds) || winnerIds.length === 0) {
        throw new Error('Winner IDs must be a non-empty array.');
      }

      const delta = Number(deltaPoints);
      if (!Number.isInteger(delta) || delta <= 0) {
        throw new Error('Score reversal delta must be a positive integer.');
      }

      // Step 1: Pre-validate all target players exist
      const targetPlayers = [];
      for (let i = 0; i < winnerIds.length; i++) {
        const id = Number(winnerIds[i]);
        const player = this.playerMap.get(id);
        if (!player) {
          throw new Error(`Cannot reverse score: Player #${id} does not exist in active registry.`);
        }
        targetPlayers.push(player);
      }

      // Step 2: Atomic score deduction (clamped at 0 to avoid negative scores)
      const updatedClones = [];
      for (let i = 0; i < targetPlayers.length; i++) {
        const p = targetPlayers[i];
        p.score = Math.max(0, p.score - delta);
        updatedClones.push({ ...p });
      }

      this.saveToStorage();
      this.notifySubscribers('MATCH_SCORES_REVERSED', {
        winnerIds: winnerIds.map(Number),
        deltaPoints: delta,
        updatedPlayers: updatedClones,
        matchRecord: matchRecord ? { ...matchRecord } : null
      });

      return updatedClones;
    },

    /**
     * Internal helper to adjust player score (for single-player adjustments)
     */
    adjustScore: function (id, deltaPoints) {
      const targetId = Number(id);
      const player = this.playerMap.get(targetId);
      if (!player) return null;

      player.score = Math.max(0, player.score + deltaPoints);
      this.saveToStorage();
      this.notifySubscribers('SCORE_ADJUSTED', player);
      return { ...player };
    },

    /**
     * Resets the data store to the 53 verified seed records from players.txt
     */
    resetDemoData: function (notify = true) {
      let seedRecords = [];
      if (window.GameSeedData && typeof window.GameSeedData.getSeedPlayers === 'function') {
        seedRecords = window.GameSeedData.getSeedPlayers();
      } else {
        // Fallback minimal seed if seed-data.js not loaded
        seedRecords = [
          { id: 101, name: 'Amit', score: 80, level: 2, team: 'NoTeam' },
          { id: 102, name: 'Rahul', score: 90, level: 4, team: 'Warriors' },
          { id: 103, name: 'Neha', score: 90, level: 3, team: 'Knights' },
          { id: 104, name: 'Arjun', score: 100, level: 5, team: 'Warriors' }
        ];
      }

      this.players = seedRecords.map(p => ({
        ...p,
        team: this.normalizeTeam(p.team),
        createdAt: new Date().toISOString()
      }));

      this.rebuildIndexMap();
      this.saveToStorage();

      if (notify) {
        this.notifySubscribers('DATA_RESET', null);
      }
      return this.players.length;
    },

    /**
     * Returns QuickSort-ranked players copy
     */
    getRanked: function () {
      if (window.GamePlayerAlgorithms && typeof window.GamePlayerAlgorithms.quickSortLeaderboard === 'function') {
        return window.GamePlayerAlgorithms.quickSortLeaderboard(this.players);
      }
      return this.players.map(p => ({ ...p })).sort((a, b) => b.score - a.score);
    },

    /**
     * Calculates real-time telemetry metrics for the dashboard
     */
    getMetrics: function () {
      const total = this.players.length;
      let soloCount = 0;
      let teamCount = 0;
      const teamSet = new Set();
      let highestScore = 0;
      let topPlayer = null;

      for (let i = 0; i < this.players.length; i++) {
        const p = this.players[i];
        if (p.team === 'NoTeam') {
          soloCount++;
        } else {
          teamCount++;
          teamSet.add(p.team);
        }

        if (p.score > highestScore || (p.score === highestScore && (!topPlayer || p.id < topPlayer.id))) {
          highestScore = p.score;
          topPlayer = p;
        }
      }

      return {
        totalPlayers: total,
        soloPlayers: soloCount,
        teamPlayers: teamCount,
        representedTeams: teamSet.size,
        teamsList: Array.from(teamSet).sort(),
        highestScore: highestScore,
        topPlayer: topPlayer ? { ...topPlayer } : null
      };
    },

    /**
     * Subscribe to state change notifications
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
          fn(event, payload, this.getAll());
        } catch (err) {
          console.error('Subscriber notification error:', err);
        }
      });
    },

    escapeHTML: escapeHTML
  };

  // Expose to global window
  window.GamePlayerData = PlayerStore;

  // Auto-init on load
  PlayerStore.init();

})(typeof window !== 'undefined' ? window : global);
