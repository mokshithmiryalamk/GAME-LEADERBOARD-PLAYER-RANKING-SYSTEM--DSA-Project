/**
 * GAME LEADERBOARD - DICE-ROLL COMBAT ENGINE & RULES
 * Faithfully mirrors Java `Main.rollNumber()` and `PlayerArray.startMatch()`.
 *
 * Game Rules:
 * - Dice Roll: Generates random integers between 1 and 100 inclusive.
 * - 1v1 Matches: Two challengers roll 1-100. Higher roll wins. Winner receives +10 points.
 * - 2v2 Matches: Team Alpha (2 players) vs Team Omega (2 players). Sum of rolls compared.
 *   Both players on the winning team receive +10 points each (+20 total team delta).
 * - Sudden Death Tie Policy: In the event of tied rolls, a sudden death reroll is executed
 *   until a decisive winner is reached, preserving full reroll logs for transparency.
 * - Injected RNG Support: Supports custom RNG injection for deterministic unit testing.
 * - Transactional Safety: Matches execute with a re-entrancy lock and atomic score awards.
 */

(function (window) {
  'use strict';

  // Default cryptographic or standard pseudo-random generator (1 to 100)
  let activeRNG = function () {
    if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
      const buffer = new Uint32Array(1);
      window.crypto.getRandomValues(buffer);
      return (buffer[0] % 100) + 1;
    }
    return Math.floor(Math.random() * 100) + 1;
  };

  let isMatchInProgress = false;

  const MatchEngine = {

    /**
     * Injects a custom RNG function for unit testing or controlled simulations
     * @param {function(): number} fn - Function returning integer 1 to 100
     */
    setRNG: function (fn) {
      if (typeof fn === 'function') {
        activeRNG = fn;
      }
    },

    /**
     * Resets RNG to default random generator
     */
    resetRNG: function () {
      activeRNG = function () {
        if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
          const buffer = new Uint32Array(1);
          window.crypto.getRandomValues(buffer);
          return (buffer[0] % 100) + 1;
        }
        return Math.floor(Math.random() * 100) + 1;
      };
    },

    /**
     * Generates a single dice roll (1–100)
     * Corresponds to Java `Main.rollNumber()`
     */
    rollDice: function () {
      const val = activeRNG();
      return Math.max(1, Math.min(100, Math.floor(val)));
    },

    /**
     * Returns whether a match is actively rolling or processing
     */
    isBusy: function () {
      return isMatchInProgress;
    },

    /**
     * Executes a 1v1 match between two players
     * @param {number} player1Id - ID of challenger 1
     * @param {number} player2Id - ID of challenger 2
     */
    play1v1Match: function (player1Id, player2Id) {
      if (isMatchInProgress) {
        throw new Error('A match simulation is currently in progress. Please wait.');
      }

      const p1Id = Number(player1Id);
      const p2Id = Number(player2Id);

      if (p1Id === p2Id) {
        throw new Error('Cannot start 1v1 match with duplicate player.');
      }

      if (!window.GamePlayerData) {
        throw new Error('Player data store is not initialized.');
      }

      const p1 = window.GamePlayerData.getById(p1Id);
      const p2 = window.GamePlayerData.getById(p2Id);

      if (!p1 || !p2) {
        throw new Error('One or both selected players do not exist in the registry.');
      }

      isMatchInProgress = true;

      try {
        let roll1 = this.rollDice();
        let roll2 = this.rollDice();
        const tieRerolls = [];

        // Sudden Death Tie Policy
        let attempts = 0;
        while (roll1 === roll2 && attempts < 10) {
          attempts++;
          tieRerolls.push({
            round: attempts,
            player1Roll: roll1,
            player2Roll: roll2,
            reason: 'Tied score triggers Sudden Death Reroll'
          });
          roll1 = this.rollDice();
          roll2 = this.rollDice();
        }

        // If still tied after 10 rerolls (statistically negligible), tie-break deterministically
        if (roll1 === roll2) {
          if (p1.id < p2.id) roll1++; else roll2++;
        }

        const isP1Winner = roll1 > roll2;
        const winnerId = isP1Winner ? p1Id : p2Id;
        const matchId = 'match_1v1_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

        const matchRecord = {
          matchId: matchId,
          matchType: '1v1',
          participantIds: [p1Id, p2Id],
          teamA: {
            playerIds: [p1Id],
            playersSnapshot: [{ id: p1.id, name: p1.name, team: p1.team, level: p1.level }],
            rolls: [roll1],
            total: roll1
          },
          teamB: {
            playerIds: [p2Id],
            playersSnapshot: [{ id: p2.id, name: p2.name, team: p2.team, level: p2.level }],
            rolls: [roll2],
            total: roll2
          },
          winnerTeam: isP1Winner ? 'teamA' : 'teamB',
          winnerIds: [winnerId],
          scoreDelta: 10,
          tieRerolls: tieRerolls,
          timestamp: new Date().toISOString(),
          status: 'COMPLETED'
        };

        // Transaction journaling for multi-key atomicity
        let txId = null;
        if (window.GameMatchData && typeof window.GameMatchData.beginTransaction === 'function') {
          txId = window.GameMatchData.beginTransaction('MATCH_COMPLETION_1V1', { matchId, winnerIds: [winnerId] });
        }

        // 1. Atomic score transaction: add +10 to winner in GamePlayerData
        window.GamePlayerData.applyMatchScoreAward([winnerId], 10, matchRecord);

        // 2. Remove participants from GameMatchQueue
        if (window.GameMatchQueue) {
          window.GameMatchQueue.removeById(p1Id);
          window.GameMatchQueue.removeById(p2Id);
        }

        // 3. Persist match record in GameMatchData for Stage 4 History
        if (window.GameMatchData && typeof window.GameMatchData.recordCompletedMatch === 'function') {
          window.GameMatchData.recordCompletedMatch(matchRecord);
        }

        if (txId && window.GameMatchData) {
          window.GameMatchData.commitTransaction(txId);
        }

        return {
          success: true,
          matchRecord: matchRecord,
          player1: { ...p1, roll: roll1 },
          player2: { ...p2, roll: roll2 },
          winner: isP1Winner ? { ...p1 } : { ...p2 },
          tieRerolls: tieRerolls
        };

      } finally {
        isMatchInProgress = false;
      }
    },

    /**
     * Executes a 2v2 match between four players (Team Alpha vs Team Omega)
     * @param {number[]} fourPlayerIds - Array of 4 distinct player IDs [p1, p2, p3, p4]
     */
    play2v2Match: function (fourPlayerIds) {
      if (isMatchInProgress) {
        throw new Error('A match simulation is currently in progress. Please wait.');
      }

      if (!Array.isArray(fourPlayerIds) || fourPlayerIds.length !== 4) {
        throw new Error('A 2v2 match requires exactly four distinct player IDs.');
      }

      const ids = fourPlayerIds.map(Number);
      const uniqueIds = new Set(ids);
      if (uniqueIds.size !== 4) {
        throw new Error('Cannot start 2v2 match: duplicate players detected.');
      }

      if (!window.GamePlayerData) {
        throw new Error('Player data store is not initialized.');
      }

      // Verify all 4 players exist
      const players = ids.map(id => window.GamePlayerData.getById(id));
      for (let i = 0; i < 4; i++) {
        if (!players[i]) {
          throw new Error(`Cannot start 2v2 match: Player #${ids[i]} does not exist.`);
        }
      }

      isMatchInProgress = true;

      try {
        const pA1 = players[0];
        const pA2 = players[1];
        const pB1 = players[2];
        const pB2 = players[3];

        let rollA1 = this.rollDice();
        let rollA2 = this.rollDice();
        let rollB1 = this.rollDice();
        let rollB2 = this.rollDice();

        let totalA = rollA1 + rollA2;
        let totalB = rollB1 + rollB2;
        const tieRerolls = [];

        // Sudden death tie resolution if team totals match
        let attempts = 0;
        while (totalA === totalB && attempts < 10) {
          attempts++;
          tieRerolls.push({
            round: attempts,
            teamATotal: totalA,
            teamBTotal: totalB,
            reason: 'Tied team roll total triggers Sudden Death Reroll'
          });
          rollA1 = this.rollDice();
          rollA2 = this.rollDice();
          rollB1 = this.rollDice();
          rollB2 = this.rollDice();
          totalA = rollA1 + rollA2;
          totalB = rollB1 + rollB2;
        }

        if (totalA === totalB) {
          // Tie-break on highest individual roll
          const maxA = Math.max(rollA1, rollA2);
          const maxB = Math.max(rollB1, rollB2);
          if (maxA > maxB) totalA++; else totalB++;
        }

        const isTeamAWinner = totalA > totalB;
        const winnerTeam = isTeamAWinner ? 'teamA' : 'teamB';
        const winnerIds = isTeamAWinner ? [pA1.id, pA2.id] : [pB1.id, pB2.id];
        const matchId = 'match_2v2_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

        const matchRecord = {
          matchId: matchId,
          matchType: '2v2',
          participantIds: ids,
          teamA: {
            playerIds: [pA1.id, pA2.id],
            playersSnapshot: [
              { id: pA1.id, name: pA1.name, team: pA1.team, level: pA1.level },
              { id: pA2.id, name: pA2.name, team: pA2.team, level: pA2.level }
            ],
            rolls: [rollA1, rollA2],
            total: totalA
          },
          teamB: {
            playerIds: [pB1.id, pB2.id],
            playersSnapshot: [
              { id: pB1.id, name: pB1.name, team: pB1.team, level: pB1.level },
              { id: pB2.id, name: pB2.name, team: pB2.team, level: pB2.level }
            ],
            rolls: [rollB1, rollB2],
            total: totalB
          },
          winnerTeam: winnerTeam,
          winnerIds: winnerIds,
          scoreDelta: 10,
          tieRerolls: tieRerolls,
          timestamp: new Date().toISOString(),
          status: 'COMPLETED'
        };

        // Transaction journaling for multi-key atomicity
        let txId = null;
        if (window.GameMatchData && typeof window.GameMatchData.beginTransaction === 'function') {
          txId = window.GameMatchData.beginTransaction('MATCH_COMPLETION_2V2', { matchId, winnerIds });
        }

        // 1. Atomic score transaction: award +10 to both winners in GamePlayerData
        window.GamePlayerData.applyMatchScoreAward(winnerIds, 10, matchRecord);

        // 2. Remove all 4 participants from GameMatchQueue
        if (window.GameMatchQueue) {
          ids.forEach(id => window.GameMatchQueue.removeById(id));
        }

        // 3. Persist match record in GameMatchData for Stage 4 History
        if (window.GameMatchData && typeof window.GameMatchData.recordCompletedMatch === 'function') {
          window.GameMatchData.recordCompletedMatch(matchRecord);
        }

        if (txId && window.GameMatchData) {
          window.GameMatchData.commitTransaction(txId);
        }

        return {
          success: true,
          matchRecord: matchRecord,
          teamA: {
            players: [pA1, pA2],
            rolls: [rollA1, rollA2],
            total: totalA
          },
          teamB: {
            players: [pB1, pB2],
            rolls: [rollB1, rollB2],
            total: totalB
          },
          winningTeam: isTeamAWinner ? 'Team Alpha' : 'Team Omega',
          winnerIds: winnerIds,
          tieRerolls: tieRerolls
        };

      } finally {
        isMatchInProgress = false;
      }
    }
  };

  window.GameMatchEngine = MatchEngine;

})(typeof window !== 'undefined' ? window : global);
