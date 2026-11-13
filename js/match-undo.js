/**
 * GAME LEADERBOARD - ATOMIC MATCH UNDO ENGINE
 * Resolves Bug A (double deduction) and Bug B (partial 2v2 undo) from original Java `MatchHistoryStack.java`.
 *
 * Guarantees:
 * - True LIFO stack semantics: always targets the latest non-undone completed match.
 * - 1v1 Reversal: Exactly -10 points deducted from the single winner (never -20).
 * - 2v2 Reversal: Reverses the entire match record atomically, deducting -10 from both winners together.
 * - Idempotency: Re-entrancy lock prevents double execution; undone matches cannot be undone again.
 * - Referential Integrity: Validates that winning players still exist in the active registry before reversal.
 */

(function (window) {
  'use strict';

  let isUndoInProgress = false;

  const MatchUndo = {

    /**
     * Checks if a player can be safely deleted without corrupting pending undos
     */
    canSafelyDeletePlayer: function (playerId) {
      if (!window.GameMatchData) return { safe: true };

      const targetId = Number(playerId);
      const latestEligible = window.GameMatchData.getLatestEligibleMatch();

      if (latestEligible && Array.isArray(latestEligible.winnerIds) && latestEligible.winnerIds.includes(targetId)) {
        return {
          safe: false,
          reason: `Cannot delete Player #${targetId}: This player is a winning participant of the latest active match (${latestEligible.matchId}). Please undo the match before deleting this contender.`
        };
      }

      return { safe: true };
    },

    /**
     * Returns whether an eligible completed match exists to be undone
     */
    canUndo: function () {
      if (isUndoInProgress) return false;
      if (!window.GameMatchData) return false;
      const latest = window.GameMatchData.getLatestEligibleMatch();
      return Boolean(latest);
    },

    /**
     * Returns the latest eligible match or null
     */
    getLatestMatch: function () {
      if (!window.GameMatchData) return null;
      return window.GameMatchData.getLatestEligibleMatch();
    },

    /**
     * Executes atomic LIFO undo of the latest completed match
     */
    undoLatestMatch: function () {
      if (isUndoInProgress) {
        throw new Error('An undo transaction is currently in progress. Please wait.');
      }

      if (!window.GameMatchData || !window.GamePlayerData) {
        throw new Error('Required data stores are not initialized.');
      }

      const match = window.GameMatchData.getLatestEligibleMatch();
      if (!match) {
        throw new Error('No eligible completed matches available in history stack to undo.');
      }

      if (match.status !== 'COMPLETED') {
        throw new Error(`Match ${match.matchId} has already been undone or is not in completed state.`);
      }

      isUndoInProgress = true;

      try {
        const winnerIds = Array.isArray(match.winnerIds) ? match.winnerIds.map(Number) : [];
        if (winnerIds.length === 0) {
          throw new Error(`Match ${match.matchId} has no recorded winners to reverse.`);
        }

        // Pre-validate all winners exist in active GamePlayerData
        for (let i = 0; i < winnerIds.length; i++) {
          const wId = winnerIds[i];
          const player = window.GamePlayerData.getById(wId);
          if (!player) {
            throw new Error(`Cannot undo match ${match.matchId}: Winner #${wId} has been deleted from the active roster.`);
          }
        }

        const scoreDelta = Number(match.scoreDelta) || 10;

        // Transaction journaling for multi-key rollback protection
        let txId = null;
        if (typeof window.GameMatchData.beginTransaction === 'function') {
          txId = window.GameMatchData.beginTransaction('MATCH_UNDO', { matchId: match.matchId, winnerIds, scoreDelta });
        }

        // 1. Atomic Score Reversal: Deduct exactly 10 points from all winners
        const reversedPlayers = window.GamePlayerData.applyMatchScoreReversal(winnerIds, scoreDelta, match);

        // 2. Mark match record as UNDONE in GameMatchData
        const reversalInfo = {
          undoneAt: new Date().toISOString(),
          reversedWinnerIds: winnerIds,
          scoreDeducted: scoreDelta
        };
        const updatedMatch = window.GameMatchData.markMatchUndone(match.matchId, reversalInfo);

        if (txId) {
          window.GameMatchData.commitTransaction(txId);
        }

        return {
          success: true,
          matchId: updatedMatch.matchId,
          match: updatedMatch,
          reversedPlayers: reversedPlayers,
          scoreDeducted: scoreDelta
        };

      } catch (err) {
        throw err;
      } finally {
        isUndoInProgress = false;
      }
    }
  };

  window.GameMatchUndo = MatchUndo;

})(typeof window !== 'undefined' ? window : global);
