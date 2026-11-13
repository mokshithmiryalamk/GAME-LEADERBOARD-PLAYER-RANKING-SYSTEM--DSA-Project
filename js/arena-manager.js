/**
 * GAME LEADERBOARD - MATCH ARENA UI CONTROLLER
 * Orchestrates the Match Arena view (#view-arena):
 * - Match lobby queue management (Join, Leave, Clear, Auto-populate demo challengers)
 * - Real-time queue capacity indicator (Capacity 50, circular array protection)
 * - 1v1 and 2v2 match launch controls (enabled strictly when sufficient challengers are queued)
 * - Animated dice-roll combat visualizer (1–100) with accessible reduced-motion support
 * - Decisive winner announcements, +10 points score celebration, and Stage 4 record logging
 */

(function (window, document) {
  'use strict';

  const ArenaManager = {
    isAnimating: false,
    currentMatchMode: '1v1', // '1v1' or '2v2'
    stagedParticipants: [],

    init: function () {
      this.cacheElements();
      this.bindEvents();
      this.subscribeToStores();
      this.render();
    },

    cacheElements: function () {
      // Lobby Controls
      this.selectPlayer = document.getElementById('select-lobby-player');
      this.btnEnqueue = document.getElementById('btn-enqueue-player');
      this.btnQuickFill = document.getElementById('btn-quick-fill-lobby');
      this.btnClearLobby = document.getElementById('btn-clear-lobby');
      this.queueCountBadge = document.getElementById('arena-queue-count');
      this.matchesCountBadge = document.getElementById('arena-matches-count');
      this.queueListEl = document.getElementById('lobby-queue-list');
      this.btnStart1v1 = document.getElementById('btn-start-1v1');
      this.btnStart2v2 = document.getElementById('btn-start-2v2');

      // Arena Matchup Elements
      this.arenaBattleArea = document.getElementById('arena-battle-area');
      this.arenaMatchTitle = document.getElementById('arena-match-title');
      this.arenaAlphaBox = document.getElementById('arena-side-alpha');
      this.arenaOmegaBox = document.getElementById('arena-side-omega');
      this.arenaVsPill = document.getElementById('arena-vs-pill');
      this.arenaActionBtn = document.getElementById('btn-execute-roll');
      this.arenaResultBanner = document.getElementById('arena-result-banner');
      this.arenaResultTitle = document.getElementById('arena-result-title');
      this.arenaResultDetails = document.getElementById('arena-result-details');
      this.btnResetMatchup = document.getElementById('btn-reset-matchup');
    },

    bindEvents: function () {
      // Enqueue selected player
      if (this.btnEnqueue) {
        this.btnEnqueue.addEventListener('click', () => {
          const playerId = this.selectPlayer ? Number(this.selectPlayer.value) : 0;
          if (playerId > 0 && window.GameMatchQueue) {
            try {
              window.GameMatchQueue.enqueue(playerId);
              if (window.GameToast) {
                const player = window.GamePlayerData ? window.GamePlayerData.getById(playerId) : null;
                const name = player ? player.name : `#${playerId}`;
                window.GameToast.success(`${name} entered the match lobby!`);
              }
              this.render();
            } catch (err) {
              if (window.GameToast) window.GameToast.warning(err.message);
            }
          }
        });
      }

      // Quick Fill Lobby with 4 available players for rapid testing/demo
      if (this.btnQuickFill) {
        this.btnQuickFill.addEventListener('click', () => {
          this.quickFillLobby();
        });
      }

      // Clear lobby queue
      if (this.btnClearLobby) {
        this.btnClearLobby.addEventListener('click', () => {
          if (window.GameMatchQueue) {
            window.GameMatchQueue.clear();
            if (window.GameToast) window.GameToast.info('Match lobby queue cleared.');
            this.render();
          }
        });
      }

      // Leave queue action delegation
      if (this.queueListEl) {
        this.queueListEl.addEventListener('click', (e) => {
          const leaveBtn = e.target.closest('[data-leave-id]');
          if (leaveBtn && window.GameMatchQueue) {
            const id = Number(leaveBtn.getAttribute('data-leave-id'));
            window.GameMatchQueue.removeById(id);
            if (window.GameToast) window.GameToast.info(`Player #${id} left the match lobby.`);
            this.render();
          }
        });
      }

      // Launch 1v1 Matchup
      if (this.btnStart1v1) {
        this.btnStart1v1.addEventListener('click', () => {
          this.stage1v1Match();
        });
      }

      // Launch 2v2 Matchup
      if (this.btnStart2v2) {
        this.btnStart2v2.addEventListener('click', () => {
          this.stage2v2Match();
        });
      }

      // Roll Dice button in Arena
      if (this.arenaActionBtn) {
        this.arenaActionBtn.addEventListener('click', () => {
          this.executeStagedMatch();
        });
      }

      // Reset Matchup / Clear Arena
      if (this.btnResetMatchup) {
        this.btnResetMatchup.addEventListener('click', () => {
          this.resetArenaView();
        });
      }
    },

    subscribeToStores: function () {
      if (window.GameMatchQueue && typeof window.GameMatchQueue.subscribe === 'function') {
        window.GameMatchQueue.subscribe(() => {
          this.render();
        });
      }

      if (window.GameMatchData && typeof window.GameMatchData.subscribe === 'function') {
        window.GameMatchData.subscribe(() => {
          this.updateMetrics();
        });
      }

      if (window.GamePlayerData && typeof window.GamePlayerData.subscribe === 'function') {
        window.GamePlayerData.subscribe(() => {
          this.populatePlayerDropdown();
          this.render();
        });
      }
    },

    quickFillLobby: function () {
      if (!window.GamePlayerData || !window.GameMatchQueue) return;
      const allPlayers = window.GamePlayerData.getAll();
      const waitingIds = new Set(window.GameMatchQueue.getWaitingIds());
      const available = allPlayers.filter(p => !waitingIds.has(p.id));

      if (available.length === 0) {
        if (window.GameToast) window.GameToast.warning('No unqueued players available in registry.');
        return;
      }

      const toAdd = available.slice(0, 4);
      toAdd.forEach(p => {
        try {
          window.GameMatchQueue.enqueue(p.id);
        } catch (e) {}
      });

      if (window.GameToast) {
        window.GameToast.success(`Added ${toAdd.length} challengers to match lobby.`);
      }
      this.render();
    },

    populatePlayerDropdown: function () {
      if (!this.selectPlayer || !window.GamePlayerData) return;
      const all = window.GamePlayerData.getAll();
      const queuedIds = new Set(window.GameMatchQueue ? window.GameMatchQueue.getWaitingIds() : []);

      const unqueued = all.filter(p => !queuedIds.has(p.id));
      const escapeHTML = window.GamePlayerData.escapeHTML;

      if (unqueued.length === 0) {
        this.selectPlayer.innerHTML = '<option value="" disabled selected>All registered players are in lobby</option>';
        if (this.btnEnqueue) this.btnEnqueue.disabled = true;
        return;
      }

      if (this.btnEnqueue) this.btnEnqueue.disabled = false;

      this.selectPlayer.innerHTML = unqueued.map(p => {
        const teamLabel = p.team && p.team !== 'NoTeam' ? ` (${p.team})` : ' (Solo)';
        return `<option value="${p.id}">#${p.id} ${escapeHTML(p.name)}${teamLabel} — LVL ${p.level}</option>`;
      }).join('');
    },

    updateMetrics: function () {
      if (this.queueCountBadge && window.GameMatchQueue) {
        const count = window.GameMatchQueue.size();
        this.queueCountBadge.textContent = `${count} / 50 Challengers`;
      }

      if (this.matchesCountBadge && window.GameMatchData) {
        const count = window.GameMatchData.getCompletedCount();
        this.matchesCountBadge.textContent = `${count} Logged Matches`;
      }
    },

    render: function () {
      this.updateMetrics();
      this.populatePlayerDropdown();

      if (!window.GameMatchQueue) return;

      const has2 = window.GameMatchQueue.hasTwoPlayers();
      const has4 = window.GameMatchQueue.hasFourPlayers();

      if (this.btnStart1v1) {
        this.btnStart1v1.disabled = !has2 || this.isAnimating;
      }
      if (this.btnStart2v2) {
        this.btnStart2v2.disabled = !has4 || this.isAnimating;
      }

      // Render Waiting Queue List
      if (this.queueListEl) {
        const waitingPlayers = window.GameMatchQueue.getWaitingPlayers();
        const escapeHTML = window.GamePlayerData ? window.GamePlayerData.escapeHTML : str => str;

        if (waitingPlayers.length === 0) {
          this.queueListEl.innerHTML = `
            <div class="empty-state" style="padding: var(--space-6) var(--space-4); width: 100%;">
              <span class="empty-state__icon" aria-hidden="true">⏳</span>
              <h3 class="empty-state__title">Match Lobby is Empty</h3>
              <p class="empty-state__desc">Select players above to join the FIFO queue and launch 1v1 or 2v2 dice matches.</p>
            </div>
          `;
          return;
        }

        const itemsHTML = waitingPlayers.map(p => `
          <div class="lobby-player-chip" data-queued-id="${p.id}">
            <span class="lobby-player-pos font-mono">#${p.queuePosition}</span>
            <span class="lobby-player-avatar">${escapeHTML(p.name.charAt(0).toUpperCase())}</span>
            <div class="lobby-player-info">
              <span class="lobby-player-name">${escapeHTML(p.name)}</span>
              <span class="lobby-player-sub font-mono">#${p.id} • LVL ${p.level} • ${escapeHTML(p.team)}</span>
            </div>
            <button type="button" class="btn-leave-queue" data-leave-id="${p.id}" title="Leave Lobby Queue" aria-label="Remove ${escapeHTML(p.name)} from lobby">
              &times;
            </button>
          </div>
        `).join('');

        this.queueListEl.innerHTML = itemsHTML;
      }
    },

    /**
     * Prepares a 1v1 Matchup in the Arena from the front 2 FIFO players
     */
    stage1v1Match: function () {
      if (!window.GameMatchQueue || !window.GameMatchQueue.hasTwoPlayers()) {
        if (window.GameToast) window.GameToast.warning('At least 2 players are required for a 1v1 match.');
        return;
      }

      const waiting = window.GameMatchQueue.getWaitingPlayers();
      const p1 = waiting[0];
      const p2 = waiting[1];

      this.currentMatchMode = '1v1';
      this.stagedParticipants = [p1.id, p2.id];

      if (this.arenaMatchTitle) {
        this.arenaMatchTitle.textContent = `1v1 Solo Combat: ${p1.name} VS ${p2.name}`;
      }

      this.render1v1Staging(p1, p2);

      // Scroll smoothly to arena battle area
      if (this.arenaBattleArea) {
        this.arenaBattleArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },

    render1v1Staging: function (p1, p2) {
      const escapeHTML = window.GamePlayerData ? window.GamePlayerData.escapeHTML : str => str;

      if (this.arenaAlphaBox) {
        this.arenaAlphaBox.innerHTML = `
          <div class="challenger-card challenger-card--alpha">
            <span class="badge badge--lime challenger-tag">Challenger Alpha</span>
            <div class="challenger-avatar challenger-avatar--lime">${escapeHTML(p1.name.charAt(0).toUpperCase())}</div>
            <h3 class="challenger-name">${escapeHTML(p1.name)}</h3>
            <div class="challenger-meta font-mono">ID: #${p1.id} • LVL ${p1.level} • ${escapeHTML(p1.team)}</div>
            <div class="challenger-score font-mono">Rating: ${p1.score} PTS</div>
            <div id="alpha-roll-display" class="dice-roll-slot font-mono">
              <span class="dice-waiting-label">Ready to Roll</span>
            </div>
          </div>
        `;
      }

      if (this.arenaOmegaBox) {
        this.arenaOmegaBox.innerHTML = `
          <div class="challenger-card challenger-card--omega">
            <span class="badge badge--magenta challenger-tag">Challenger Omega</span>
            <div class="challenger-avatar challenger-avatar--magenta">${escapeHTML(p2.name.charAt(0).toUpperCase())}</div>
            <h3 class="challenger-name">${escapeHTML(p2.name)}</h3>
            <div class="challenger-meta font-mono">ID: #${p2.id} • LVL ${p2.level} • ${escapeHTML(p2.team)}</div>
            <div class="challenger-score font-mono">Rating: ${p2.score} PTS</div>
            <div id="omega-roll-display" class="dice-roll-slot font-mono">
              <span class="dice-waiting-label">Ready to Roll</span>
            </div>
          </div>
        `;
      }

      if (this.arenaActionBtn) {
        this.arenaActionBtn.style.display = 'inline-flex';
        this.arenaActionBtn.disabled = false;
        this.arenaActionBtn.textContent = '🎲 Roll Dice (1–100)';
      }

      if (this.arenaResultBanner) {
        this.arenaResultBanner.style.display = 'none';
      }
    },

    /**
     * Prepares a 2v2 Matchup in the Arena from the front 4 FIFO players
     */
    stage2v2Match: function () {
      if (!window.GameMatchQueue || !window.GameMatchQueue.hasFourPlayers()) {
        if (window.GameToast) window.GameToast.warning('At least 4 players are required for a 2v2 match.');
        return;
      }

      const waiting = window.GameMatchQueue.getWaitingPlayers();
      const pA1 = waiting[0];
      const pA2 = waiting[1];
      const pB1 = waiting[2];
      const pB2 = waiting[3];

      this.currentMatchMode = '2v2';
      this.stagedParticipants = [pA1.id, pA2.id, pB1.id, pB2.id];

      if (this.arenaMatchTitle) {
        this.arenaMatchTitle.textContent = `2v2 Squad Clash: [${pA1.name} & ${pA2.name}] VS [${pB1.name} & ${pB2.name}]`;
      }

      this.render2v2Staging(pA1, pA2, pB1, pB2);

      if (this.arenaBattleArea) {
        this.arenaBattleArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },

    render2v2Staging: function (pA1, pA2, pB1, pB2) {
      const escapeHTML = window.GamePlayerData ? window.GamePlayerData.escapeHTML : str => str;

      if (this.arenaAlphaBox) {
        this.arenaAlphaBox.innerHTML = `
          <div class="team-squad-box team-squad-box--alpha">
            <span class="badge badge--lime challenger-tag">Squad Alpha (Team 1)</span>
            <div class="squad-members-row">
              <div class="squad-player-mini">
                <span class="mini-avatar mini-avatar--lime">${escapeHTML(pA1.name.charAt(0).toUpperCase())}</span>
                <span class="mini-name">${escapeHTML(pA1.name)} (#${pA1.id})</span>
              </div>
              <div class="squad-player-mini">
                <span class="mini-avatar mini-avatar--lime">${escapeHTML(pA2.name.charAt(0).toUpperCase())}</span>
                <span class="mini-name">${escapeHTML(pA2.name)} (#${pA2.id})</span>
              </div>
            </div>
            <div id="alpha-roll-display" class="dice-roll-slot font-mono">
              <span class="dice-waiting-label">Squad Rolls Awaiting</span>
            </div>
          </div>
        `;
      }

      if (this.arenaOmegaBox) {
        this.arenaOmegaBox.innerHTML = `
          <div class="team-squad-box team-squad-box--omega">
            <span class="badge badge--magenta challenger-tag">Squad Omega (Team 2)</span>
            <div class="squad-members-row">
              <div class="squad-player-mini">
                <span class="mini-avatar mini-avatar--magenta">${escapeHTML(pB1.name.charAt(0).toUpperCase())}</span>
                <span class="mini-name">${escapeHTML(pB1.name)} (#${pB1.id})</span>
              </div>
              <div class="squad-player-mini">
                <span class="mini-avatar mini-avatar--magenta">${escapeHTML(pB2.name.charAt(0).toUpperCase())}</span>
                <span class="mini-name">${escapeHTML(pB2.name)} (#${pB2.id})</span>
              </div>
            </div>
            <div id="omega-roll-display" class="dice-roll-slot font-mono">
              <span class="dice-waiting-label">Squad Rolls Awaiting</span>
            </div>
          </div>
        `;
      }

      if (this.arenaActionBtn) {
        this.arenaActionBtn.style.display = 'inline-flex';
        this.arenaActionBtn.disabled = false;
        this.arenaActionBtn.textContent = '🎲 Roll Squad Dice (4x)';
      }

      if (this.arenaResultBanner) {
        this.arenaResultBanner.style.display = 'none';
      }
    },

    executeStagedMatch: function () {
      if (this.isAnimating || !window.GameMatchEngine) return;

      if (this.currentMatchMode === '1v1') {
        if (this.stagedParticipants.length < 2) return;
        this.run1v1Simulation();
      } else if (this.currentMatchMode === '2v2') {
        if (this.stagedParticipants.length < 4) return;
        this.run2v2Simulation();
      }
    },

    run1v1Simulation: function () {
      const p1Id = this.stagedParticipants[0];
      const p2Id = this.stagedParticipants[1];

      this.isAnimating = true;
      if (this.arenaActionBtn) this.arenaActionBtn.disabled = true;

      const alphaDisplay = document.getElementById('alpha-roll-display');
      const omegaDisplay = document.getElementById('omega-roll-display');

      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const animationCycles = prefersReducedMotion ? 1 : 6;
      let cycle = 0;

      const animInterval = setInterval(() => {
        cycle++;
        if (alphaDisplay) alphaDisplay.innerHTML = `<span class="dice-rolling-number">${Math.floor(Math.random() * 100) + 1}</span>`;
        if (omegaDisplay) omegaDisplay.innerHTML = `<span class="dice-rolling-number">${Math.floor(Math.random() * 100) + 1}</span>`;

        if (cycle >= animationCycles) {
          clearInterval(animInterval);
          this.finalize1v1Match(p1Id, p2Id, alphaDisplay, omegaDisplay);
        }
      }, 70);
    },

    finalize1v1Match: function (p1Id, p2Id, alphaDisplay, omegaDisplay) {
      try {
        const result = window.GameMatchEngine.play1v1Match(p1Id, p2Id);
        const escapeHTML = window.GamePlayerData ? window.GamePlayerData.escapeHTML : str => str;

        const isAlphaWinner = result.winner.id === p1Id;

        if (alphaDisplay) {
          alphaDisplay.innerHTML = `
            <div class="dice-final-val ${isAlphaWinner ? 'dice-final-val--winner' : ''}">
              ${result.player1.roll}
            </div>
            <span class="dice-status-pill">${isAlphaWinner ? '👑 WINNER' : 'DEFEAT'}</span>
          `;
        }

        if (omegaDisplay) {
          omegaDisplay.innerHTML = `
            <div class="dice-final-val ${!isAlphaWinner ? 'dice-final-val--winner' : ''}">
              ${result.player2.roll}
            </div>
            <span class="dice-status-pill">${!isAlphaWinner ? '👑 WINNER' : 'DEFEAT'}</span>
          `;
        }

        if (this.arenaResultBanner && this.arenaResultTitle && this.arenaResultDetails) {
          this.arenaResultTitle.innerHTML = `🏆 Victory: ${escapeHTML(result.winner.name)} Wins! (+10 Score Points)`;
          this.arenaResultDetails.textContent = `Match ID: ${result.matchRecord.matchId} • Final Rolls: ${result.player1.roll} VS ${result.player2.roll}`;
          this.arenaResultBanner.style.display = 'block';
        }

        if (this.arenaActionBtn) {
          this.arenaActionBtn.style.display = 'none';
        }

        if (window.GameToast) {
          window.GameToast.success(`Match complete! ${result.winner.name} awarded +10 PTS!`);
        }

      } catch (err) {
        if (window.GameToast) window.GameToast.error(err.message);
      } finally {
        this.isAnimating = false;
        this.stagedParticipants = [];
        this.render();
      }
    },

    run2v2Simulation: function () {
      const fourIds = [...this.stagedParticipants];
      this.isAnimating = true;
      if (this.arenaActionBtn) this.arenaActionBtn.disabled = true;

      const alphaDisplay = document.getElementById('alpha-roll-display');
      const omegaDisplay = document.getElementById('omega-roll-display');

      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const animationCycles = prefersReducedMotion ? 1 : 6;
      let cycle = 0;

      const animInterval = setInterval(() => {
        cycle++;
        if (alphaDisplay) alphaDisplay.innerHTML = `<span class="dice-rolling-number">Sum: ${Math.floor(Math.random() * 150) + 20}</span>`;
        if (omegaDisplay) omegaDisplay.innerHTML = `<span class="dice-rolling-number">Sum: ${Math.floor(Math.random() * 150) + 20}</span>`;

        if (cycle >= animationCycles) {
          clearInterval(animInterval);
          this.finalize2v2Match(fourIds, alphaDisplay, omegaDisplay);
        }
      }, 70);
    },

    finalize2v2Match: function (fourIds, alphaDisplay, omegaDisplay) {
      try {
        const result = window.GameMatchEngine.play2v2Match(fourIds);
        const escapeHTML = window.GamePlayerData ? window.GamePlayerData.escapeHTML : str => str;

        const isTeamAWinner = result.winningTeam === 'Team Alpha';

        if (alphaDisplay) {
          alphaDisplay.innerHTML = `
            <div class="dice-final-val ${isTeamAWinner ? 'dice-final-val--winner' : ''}">
              ${result.teamA.total} PTS
            </div>
            <div class="dice-sub-rolls font-mono">(${result.teamA.rolls[0]} + ${result.teamA.rolls[1]})</div>
            <span class="dice-status-pill">${isTeamAWinner ? '👑 SQUAD WINNER' : 'DEFEAT'}</span>
          `;
        }

        if (omegaDisplay) {
          omegaDisplay.innerHTML = `
            <div class="dice-final-val ${!isTeamAWinner ? 'dice-final-val--winner' : ''}">
              ${result.teamB.total} PTS
            </div>
            <div class="dice-sub-rolls font-mono">(${result.teamB.rolls[0]} + ${result.teamB.rolls[1]})</div>
            <span class="dice-status-pill">${!isTeamAWinner ? '👑 SQUAD WINNER' : 'DEFEAT'}</span>
          `;
        }

        if (this.arenaResultBanner && this.arenaResultTitle && this.arenaResultDetails) {
          this.arenaResultTitle.innerHTML = `🏆 Squad Victory: ${escapeHTML(result.winningTeam)} Prevails! (+10 PTS Each)`;
          this.arenaResultDetails.textContent = `Match ID: ${result.matchRecord.matchId} • Squad Totals: ${result.teamA.total} PTS VS ${result.teamB.total} PTS`;
          this.arenaResultBanner.style.display = 'block';
        }

        if (this.arenaActionBtn) {
          this.arenaActionBtn.style.display = 'none';
        }

        if (window.GameToast) {
          window.GameToast.success(`2v2 match complete! Winning squad members each awarded +10 PTS!`);
        }

      } catch (err) {
        if (window.GameToast) window.GameToast.error(err.message);
      } finally {
        this.isAnimating = false;
        this.stagedParticipants = [];
        this.render();
      }
    },

    resetArenaView: function () {
      this.stagedParticipants = [];
      this.isAnimating = false;

      if (this.arenaMatchTitle) {
        this.arenaMatchTitle.textContent = 'Arena Matchup: Waiting for Challenger Staging';
      }

      if (this.arenaAlphaBox) {
        this.arenaAlphaBox.innerHTML = `
          <div class="challenger-box challenger-box--player1">
            <span class="badge badge--lime" style="margin-bottom: var(--space-3);">Challenger Alpha</span>
            <div style="font-size: 2.5rem; margin-bottom: var(--space-2);">🛡️</div>
            <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-1);">Queue Front Position</h3>
            <p style="font-size: var(--text-xs); color: var(--color-text-muted);">Launch a 1v1 or 2v2 match from the lobby above.</p>
          </div>
        `;
      }

      if (this.arenaOmegaBox) {
        this.arenaOmegaBox.innerHTML = `
          <div class="challenger-box challenger-box--player2">
            <span class="badge badge--magenta" style="margin-bottom: var(--space-3);">Challenger Omega</span>
            <div style="font-size: 2.5rem; margin-bottom: var(--space-2);">⚔️</div>
            <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-1);">Queue Contender Position</h3>
            <p style="font-size: var(--text-xs); color: var(--color-text-muted);">Launch a 1v1 or 2v2 match from the lobby above.</p>
          </div>
        `;
      }

      if (this.arenaActionBtn) {
        this.arenaActionBtn.style.display = 'none';
      }

      if (this.arenaResultBanner) {
        this.arenaResultBanner.style.display = 'none';
      }
    }
  };

  window.GameArenaManager = ArenaManager;

})(typeof window !== 'undefined' ? window : global, typeof document !== 'undefined' ? document : null);
