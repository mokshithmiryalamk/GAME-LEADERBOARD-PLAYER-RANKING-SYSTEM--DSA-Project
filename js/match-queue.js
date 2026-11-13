/**
 * GAME LEADERBOARD - CIRCULAR FIFO MATCHMAKING QUEUE
 * Resolves the linear index exhaustion flaw of Java `PlayerQueue.java`.
 *
 * Characteristics:
 * - Fixed maximum capacity of 50 players matching the original Java specification
 * - Circular index arithmetic: (rear + 1) % capacity and (front + 1) % capacity
 * - Prevents array overflow across indefinite enqueue/dequeue operations
 * - Stores immutable Player IDs rather than mutable/stale object copies
 * - Enforces uniqueness: duplicate queued IDs are rejected
 * - Validates player existence against GamePlayerData
 * - Supports reactive change subscriptions and automatic cleanup on player deletion
 */

(function (window) {
  'use strict';

  const DEFAULT_CAPACITY = 50;

  function createCircularQueue(capacity = DEFAULT_CAPACITY) {
    let items = new Array(capacity).fill(null);
    let front = 0;
    let rear = -1;
    let count = 0;
    const subscribers = new Set();

    function notify(eventType, payload) {
      subscribers.forEach(fn => {
        try {
          fn(eventType, payload, queueInstance.getWaitingIds());
        } catch (err) {
          console.error('MatchQueue listener error:', err);
        }
      });
    }

    const queueInstance = {
      capacity: capacity,

      /**
       * Returns current number of players in the queue
       */
      size: function () {
        return count;
      },

      /**
       * Checks if queue is empty
       */
      isEmpty: function () {
        return count === 0;
      },

      /**
       * Checks if queue is at maximum capacity
       */
      isFull: function () {
        return count >= capacity;
      },

      /**
       * Checks if at least 2 players are queued for a 1v1 match
       * Mirrors Java `PlayerQueue.hasTwoPlayers()`
       */
      hasTwoPlayers: function () {
        return count >= 2;
      },

      /**
       * Checks if at least 4 players are queued for a 2v2 match
       */
      hasFourPlayers: function () {
        return count >= 4;
      },

      /**
       * Checks if a specific player ID is currently queued
       */
      hasPlayer: function (playerId) {
        const id = Number(playerId);
        for (let i = 0; i < count; i++) {
          const idx = (front + i) % capacity;
          if (items[idx] === id) return true;
        }
        return false;
      },

      /**
       * Enqueues a player ID into the matchmaking lobby
       * @param {number} playerId - Unique ID of the player
       */
      enqueue: function (playerId, silent = false) {
        if (count >= capacity) {
          throw new Error(`Match lobby is full! Maximum capacity is ${capacity} challengers.`);
        }

        const id = Number(playerId);
        if (!Number.isInteger(id) || id <= 0) {
          throw new Error('Invalid player ID for matchmaking queue.');
        }

        // Verify player exists in GamePlayerData
        if (window.GamePlayerData && typeof window.GamePlayerData.getById === 'function') {
          const player = window.GamePlayerData.getById(id);
          if (!player) {
            throw new Error(`Cannot queue player: ID #${id} does not exist in registry.`);
          }
        }

        // Prevent duplicate queueing
        if (this.hasPlayer(id)) {
          throw new Error(`Player #${id} is already waiting in the match lobby.`);
        }

        rear = (rear + 1) % capacity;
        items[rear] = id;
        count++;

        if (!silent) {
          notify('PLAYER_ENQUEUED', { playerId: id });
        }

        return true;
      },

      /**
       * Dequeues the front player ID from the matchmaking lobby (FIFO)
       * Mirrors Java `PlayerQueue.dequeue()`
       */
      dequeue: function (silent = false) {
        if (count === 0) {
          return null;
        }

        const id = items[front];
        items[front] = null;
        front = (front + 1) % capacity;
        count--;

        if (!silent) {
          notify('PLAYER_DEQUEUED', { playerId: id });
        }

        return id;
      },

      /**
       * Peeks at the front player ID without removing
       */
      peek: function () {
        if (count === 0) return null;
        return items[front];
      },

      /**
       * Removes a specific player ID from the queue (e.g. Leave Lobby or Player Deleted)
       */
      removeById: function (playerId) {
        const id = Number(playerId);
        if (!this.hasPlayer(id)) {
          return false;
        }

        // Extract remaining FIFO IDs
        const remaining = this.getWaitingIds().filter(existingId => existingId !== id);

        // Reset and rebuild circular pointers
        items = new Array(capacity).fill(null);
        front = 0;
        rear = -1;
        count = 0;

        for (let i = 0; i < remaining.length; i++) {
          rear = (rear + 1) % capacity;
          items[rear] = remaining[i];
          count++;
        }

        notify('PLAYER_REMOVED', { playerId: id });
        return true;
      },

      /**
       * Returns an array of waiting player IDs in exact FIFO order
       */
      getWaitingIds: function () {
        const result = [];
        for (let i = 0; i < count; i++) {
          const idx = (front + i) % capacity;
          if (items[idx] !== null) {
            result.push(items[idx]);
          }
        }
        return result;
      },

      /**
       * Returns array of fresh player objects from GamePlayerData in FIFO order.
       * Automatically purges any player IDs that no longer exist in the store.
       */
      getWaitingPlayers: function () {
        const ids = this.getWaitingIds();
        const players = [];
        const staleIds = [];

        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          let p = null;
          if (window.GamePlayerData && typeof window.GamePlayerData.getById === 'function') {
            p = window.GamePlayerData.getById(id);
          }

          if (p) {
            players.push({ ...p, queuePosition: i + 1 });
          } else {
            staleIds.push(id);
          }
        }

        // Auto-purge stale/deleted IDs
        if (staleIds.length > 0) {
          staleIds.forEach(id => this.removeById(id));
        }

        return players;
      },

      /**
       * Clears all waiting players from the queue
       */
      clear: function (silent = false) {
        items = new Array(capacity).fill(null);
        front = 0;
        rear = -1;
        count = 0;

        if (!silent) {
          notify('QUEUE_CLEARED', null);
        }
      },

      /**
       * Subscribes to queue state changes
       */
      subscribe: function (callback) {
        if (typeof callback === 'function') {
          subscribers.add(callback);
        }
        return () => {
          subscribers.delete(callback);
        };
      }
    };

    return queueInstance;
  }

  // Singleton instance
  const MatchQueue = createCircularQueue(DEFAULT_CAPACITY);

  // Hook into GamePlayerData if available to auto-purge deleted players
  if (window.GamePlayerData && typeof window.GamePlayerData.subscribe === 'function') {
    window.GamePlayerData.subscribe((event, payload) => {
      if (event === 'PLAYER_DELETED' && payload && payload.id) {
        MatchQueue.removeById(payload.id);
      } else if (event === 'DATA_RESET') {
        MatchQueue.clear();
      }
    });
  }

  // Expose creator and singleton instance
  window.GameMatchQueue = MatchQueue;
  window.GameMatchQueueFactory = {
    create: createCircularQueue
  };

})(typeof window !== 'undefined' ? window : global);
