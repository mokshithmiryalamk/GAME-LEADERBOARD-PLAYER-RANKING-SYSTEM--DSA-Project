/**
 * GAME LEADERBOARD - MATCH HISTORY & UNDO UI MANAGER
 * Orchestrates the Match History view (#view-history):
 * - Renders LIFO match timeline (newest matches on top)
 * - Multi-criteria filtering: All, Solo 1v1, Team 2v2, Completed, Undone
 * - Player handle / ID search filtering
 * - Interactive Match Dossier Modal
 * - LIFO Undo Confirmation Modal with atomic execution
 * - Stack depth telemetry indicator (Stack Depth: N / 100)
 */

(function (window, document) {
  'use strict';

  const HistoryManager = {
    selectedFilter: 'all',
    searchQuery: '',

    init: function () {
      this.cacheElements();
      this.bindEvents();
      this.subscribeToStores();
      this.render();
    },

    cacheElements: function () {
      this.timelineContainer = document.getElementById('history-timeline-container');
      this.stackDepthEl = document.getElementById('history-stack-depth');
      this.btnUndoLast = document.getElementById('btn-undo-last-match');
      this.searchInput = document.getElementById('history-search-input');
      this.filterPills = document.querySelectorAll('.history-filter-pill');

      // Modals
      this.modalConfirmUndo = document.getElementById('modal-confirm-undo');
      this.undoNoticeEl = document.getElementById('undo-match-notice');
      this.btnConfirmUndoAction = document.getElementById('btn-confirm-undo-action');

      this.modalMatchDetails = document.getElementById('modal-match-details');
      this.matchDetailsContent = document.getElementById('match-details-content');
    },

    bindEvents: function () {
      // Search input
      if (this.searchInput) {
        this.searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.trim().toLowerCase();
          this.render();
        });
      }

      // Filter pills
      this.filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
          this.filterPills.forEach(p => p.classList.remove('is-active'));
          pill.classList.add('is-active');
          this.selectedFilter = pill.getAttribute('data-filter') || 'all';
          this.render();
        });
      });

      // Undo button trigger
      if (this.btnUndoLast) {
        this.btnUndoLast.addEventListener('click', () => {
          this.openUndoConfirmationModal();
        });
      }

      // Confirm Undo action
      if (this.btnConfirmUndoAction) {
        this.btnConfirmUndoAction.addEventListener('click', () => {
          this.executeUndo();
        });
      }

      // Timeline delegation for View Dossier
      if (this.timelineContainer) {
        this.timelineContainer.addEventListener('click', (e) => {
          const btnView = e.target.closest('[data-view-match-id]');
          if (btnView) {
            const matchId = btnView.getAttribute('data-view-match-id');
            this.showMatchDossier(matchId);
          }
        });
      }
    },

    subscribeToStores: function () {
      if (window.GameMatchData && typeof window.GameMatchData.subscribe === 'function') {
        window.GameMatchData.subscribe(() => {
          this.render();
        });
      }

      if (window.GamePlayerData && typeof window.GamePlayerData.subscribe === 'function') {
        window.GamePlayerData.subscribe(() => {
          this.render();
        });
      }
    },

    getFilteredMatches: function () {
      if (!window.GameMatchData) return [];
      const all = window.GameMatchData.getCompletedMatches();

      // History is displayed in strict LIFO order (newest matches on top)
      const lifoMatches = [...all].reverse();

      return lifoMatches.filter(m => {
        // Mode/Status filter
        if (this.selectedFilter === '1v1' && m.matchType !== '1v1') return false;
        if (this.selectedFilter === '2v2' && m.matchType !== '2v2') return false;
        if (this.selectedFilter === 'completed' && m.status !== 'COMPLETED') return false;
        if (this.selectedFilter === 'undone' && m.status !== 'UNDONE') return false;

        // Search filter
        if (this.searchQuery) {
          const q = this.searchQuery;
          const matchIdHit = m.matchId.toLowerCase().includes(q);

          // Check participant IDs
          const idHit = m.participantIds.some(id => String(id).includes(q));

          // Check participant names in snapshot
          const snapA = (m.teamA && m.teamA.playersSnapshot) || [];
          const snapB = (m.teamB && m.teamB.playersSnapshot) || [];
          const nameHit = [...snapA, ...snapB].some(p => p.name && p.name.toLowerCase().includes(q));

          if (!matchIdHit && !idHit && !nameHit) return false;
        }

        return true;
      });
    },

    render: function () {
      const matches = this.getFilteredMatches();
      const allMatches = window.GameMatchData ? window.GameMatchData.getCompletedMatches() : [];
      const activeCount = window.GameMatchData ? window.GameMatchData.getActiveCompletedCount() : 0;
      const canUndo = window.GameMatchUndo ? window.GameMatchUndo.canUndo() : false;

      // Update Stack Depth & Undo Button state
      if (this.stackDepthEl) {
        this.stackDepthEl.innerHTML = `Active Stack Depth: <strong>${activeCount} / 100</strong> <span style="font-size: 0.72rem; color: var(--color-text-muted);">(${allMatches.length} Total Logged)</span>`;
      }

      if (this.btnUndoLast) {
        this.btnUndoLast.disabled = !canUndo;
        if (canUndo) {
          const candidate = window.GameMatchUndo.getLatestMatch();
          this.btnUndoLast.title = `Undo latest active match: ${candidate ? candidate.matchId : ''}`;
        } else {
          this.btnUndoLast.title = 'No active completed matches to undo';
        }
      }

      if (!this.timelineContainer) return;

      if (matches.length === 0) {
        this.timelineContainer.innerHTML = `
          <div class="empty-state" style="padding: var(--space-8) 0;">
            <span class="empty-state__icon" aria-hidden="true">📜</span>
            <h3 class="empty-state__title">No Matches in History</h3>
            <p class="empty-state__desc">When gameplay matches are completed in the Match Arena, chronological records will appear here.</p>
          </div>
        `;
        return;
      }

      const escapeHTML = window.GamePlayerData ? window.GamePlayerData.escapeHTML : str => str;

      this.timelineContainer.innerHTML = matches.map(m => {
        const isUndone = m.status === 'UNDONE';
        const dateStr = new Date(m.timestamp).toLocaleString();

        const teamANames = this.formatSquadNames(m.teamA);
        const teamBNames = this.formatSquadNames(m.teamB);
        const winnerNames = this.formatWinnerNames(m);

        return `
          <div class="history-match-card ${isUndone ? 'history-match-card--undone' : ''}" data-match-id="${m.matchId}">
            <div class="history-match-header">
              <div class="history-match-meta">
                <span class="badge ${m.matchType === '1v1' ? 'badge--lime' : 'badge--magenta'}">${m.matchType === '1v1' ? 'Solo 1v1' : 'Team 2v2'}</span>
                <span class="history-match-id font-mono">${escapeHTML(m.matchId)}</span>
                <span class="history-match-time font-mono">${dateStr}</span>
              </div>
              <div class="history-status-wrap">
                <span class="status-badge ${isUndone ? 'status-badge--undone' : 'status-badge--completed'} font-mono">
                  ${isUndone ? '↩️ UNDONE' : '✓ COMPLETED'}
                </span>
                <button type="button" class="btn-action btn-action--view" data-view-match-id="${m.matchId}" title="View Full Match Dossier" aria-label="View match ${m.matchId} dossier">
                  👁️
                </button>
              </div>
            </div>

            <div class="history-match-combat-grid">
              <div class="history-squad history-squad--alpha ${m.winnerTeam === 'teamA' && !isUndone ? 'history-squad--winner' : ''}">
                <span class="squad-label font-mono">Squad Alpha</span>
                <span class="squad-names">${teamANames}</span>
                <div class="squad-roll-chip font-mono">Roll: <strong>${m.teamA.total}</strong></div>
              </div>

              <div class="history-vs-divider font-mono">VS</div>

              <div class="history-squad history-squad--omega ${m.winnerTeam === 'teamB' && !isUndone ? 'history-squad--winner' : ''}">
                <span class="squad-label font-mono">Squad Omega</span>
                <span class="squad-names">${teamBNames}</span>
                <div class="squad-roll-chip font-mono">Roll: <strong>${m.teamB.total}</strong></div>
              </div>
            </div>

            <div class="history-match-footer">
              <div class="history-winner-info">
                ${isUndone
                  ? `<span class="reversal-notice font-mono">Reversed: -${m.scoreDelta} PTS removed from ${winnerNames}</span>`
                  : `<span class="winner-notice font-mono">🏆 Winner: <strong>${winnerNames}</strong> (+${m.scoreDelta} PTS)</span>`
                }
              </div>
              ${m.tieRerolls && m.tieRerolls.length > 0 ? `<span class="badge badge--neutral font-mono" style="font-size: 0.68rem;">Sudden Death Rerolls: ${m.tieRerolls.length}</span>` : ''}
            </div>
          </div>
        `;
      }).join('');
    },

    formatSquadNames: function (teamObj) {
      if (!teamObj) return 'Unknown';
      const escapeHTML = window.GamePlayerData ? window.GamePlayerData.escapeHTML : str => str;

      if (Array.isArray(teamObj.playersSnapshot) && teamObj.playersSnapshot.length > 0) {
        return teamObj.playersSnapshot.map(p => `${escapeHTML(p.name)} (#${p.id})`).join(' & ');
      }

      if (Array.isArray(teamObj.playerIds)) {
        return teamObj.playerIds.map(id => {
          const p = window.GamePlayerData ? window.GamePlayerData.getById(id) : null;
          return p ? `${escapeHTML(p.name)} (#${p.id})` : `#${id}`;
        }).join(' & ');
      }

      return 'Unknown';
    },

    formatWinnerNames: function (match) {
      if (!match || !Array.isArray(match.winnerIds)) return 'Unknown';
      const escapeHTML = window.GamePlayerData ? window.GamePlayerData.escapeHTML : str => str;

      const winningSquad = match.winnerTeam === 'teamA' ? match.teamA : match.teamB;
      if (winningSquad && Array.isArray(winningSquad.playersSnapshot) && winningSquad.playersSnapshot.length > 0) {
        return winningSquad.playersSnapshot.map(p => escapeHTML(p.name)).join(' & ');
      }

      return match.winnerIds.map(id => {
        const p = window.GamePlayerData ? window.GamePlayerData.getById(id) : null;
        return p ? escapeHTML(p.name) : `#${id}`;
      }).join(' & ');
    },

    openUndoConfirmationModal: function () {
      if (!window.GameMatchUndo || !window.GameMatchUndo.canUndo()) {
        if (window.GameToast) window.GameToast.warning('No eligible completed matches to undo.');
        return;
      }

      const match = window.GameMatchUndo.getLatestMatch();
      if (!match || !this.undoNoticeEl) return;

      const winnerNames = this.formatWinnerNames(match);

      this.undoNoticeEl.innerHTML = `
        <div style="font-size: var(--text-sm); line-height: 1.6;">
          <p style="margin-bottom: var(--space-3);">
            Are you sure you want to undo the latest completed match?
          </p>
          <div class="card" style="background: var(--color-bg-secondary); padding: var(--space-3); margin-bottom: var(--space-3); font-family: var(--font-mono); font-size: 0.8rem;">
            <div><strong>Match ID:</strong> ${match.matchId}</div>
            <div><strong>Mode:</strong> ${match.matchType}</div>
            <div><strong>Winner(s):</strong> ${winnerNames}</div>
            <div style="color: var(--color-warning);"><strong>Score Reversal:</strong> Exactly -${match.scoreDelta} points will be deducted.</div>
          </div>
          <p style="font-size: 0.75rem; color: var(--color-text-muted);">
            This operation is atomic and strictly follows LIFO stack rules. It cannot be undone twice.
          </p>
        </div>
      `;

      if (window.GameModal) window.GameModal.open('modal-confirm-undo');
    },

    executeUndo: function () {
      if (!window.GameMatchUndo) return;

      try {
        const res = window.GameMatchUndo.undoLatestMatch();
        if (window.GameModal) window.GameModal.close('modal-confirm-undo');

        if (window.GameToast) {
          const names = res.reversedPlayers.map(p => p.name).join(' and ');
          window.GameToast.success(`Match ${res.match.matchId} undone. Exactly ${res.scoreDeducted} PTS deducted from ${names}.`);
        }

        this.render();
      } catch (err) {
        if (window.GameToast) window.GameToast.error(err.message);
      }
    },

    showMatchDossier: function (matchId) {
      if (!window.GameMatchData || !this.matchDetailsContent) return;
      const match = window.GameMatchData.getMatchById(matchId);
      if (!match) return;

      const escapeHTML = window.GamePlayerData ? window.GamePlayerData.escapeHTML : str => str;
      const isUndone = match.status === 'UNDONE';

      this.matchDetailsContent.innerHTML = `
        <div class="match-dossier-card">
          <div class="match-dossier-header">
            <span class="badge ${match.matchType === '1v1' ? 'badge--lime' : 'badge--magenta'}">${match.matchType === '1v1' ? 'Solo 1v1 Challenger' : 'Team 2v2 Squad Clash'}</span>
            <span class="status-badge ${isUndone ? 'status-badge--undone' : 'status-badge--completed'} font-mono">${isUndone ? 'UNDONE' : 'COMPLETED'}</span>
          </div>

          <div class="match-dossier-meta font-mono" style="font-size: 0.75rem; color: var(--color-text-secondary); margin: var(--space-3) 0;">
            <div>Match ID: ${escapeHTML(match.matchId)}</div>
            <div>Timestamp: ${new Date(match.timestamp).toLocaleString()}</div>
            ${match.undoneAt ? `<div style="color: var(--color-warning);">Undone At: ${new Date(match.undoneAt).toLocaleString()}</div>` : ''}
          </div>

          <div class="match-dossier-combat-grid">
            <div class="dossier-side dossier-side--alpha">
              <h4>Squad Alpha (Team 1)</h4>
              <p>${this.formatSquadNames(match.teamA)}</p>
              <div class="font-mono">Rolls: ${match.teamA.rolls.join(' + ')} = <strong>${match.teamA.total}</strong></div>
            </div>

            <div class="dossier-side dossier-side--omega">
              <h4>Squad Omega (Team 2)</h4>
              <p>${this.formatSquadNames(match.teamB)}</p>
              <div class="font-mono">Rolls: ${match.teamB.rolls.join(' + ')} = <strong>${match.teamB.total}</strong></div>
            </div>
          </div>

          ${match.tieRerolls && match.tieRerolls.length > 0 ? `
            <div class="card" style="margin-top: var(--space-3); background: var(--color-bg-secondary); padding: var(--space-3);">
              <h5 style="font-size: 0.75rem; color: var(--color-amber);">Sudden Death Reroll Logs (${match.tieRerolls.length} Rounds)</h5>
              ${match.tieRerolls.map(r => `<div class="font-mono" style="font-size: 0.7rem; color: var(--color-text-muted);">Round ${r.round}: ${r.reason}</div>`).join('')}
            </div>
          ` : ''}
        </div>
      `;

      if (window.GameModal) window.GameModal.open('modal-match-details');
    }
  };

  window.GameHistoryManager = HistoryManager;

})(typeof window !== 'undefined' ? window : global, typeof document !== 'undefined' ? document : null);
