/**
 * GAME LEADERBOARD - PLAYER REGISTRY MANAGER
 * Orchestrates the Player Registry view (#view-registry):
 * - Live data table rendering with XSS-safe encoding
 * - 5 algorithmic search runners with real-time performance telemetry
 * - Team affiliation filter pills and column sorting
 * - Full CRUD modal workflows: Add, Edit, Delete, Details, Reset Demo Data
 */

(function (window, document) {
  'use strict';

  const PlayerManager = {
    selectedAlgorithm: 'linear_name',
    searchQuery: '',
    selectedTeam: 'all',
    sortBy: 'id_asc',
    lastTelemetry: null,

    init: function () {
      this.cacheElements();
      this.bindEvents();
      this.subscribeToStore();
      this.render();
    },

    cacheElements: function () {
      this.tableBody = document.getElementById('registry-table-body');
      this.searchInput = document.getElementById('registry-search-input');
      this.searchClearBtn = document.getElementById('btn-clear-search');
      this.algorithmSelect = document.getElementById('registry-algorithm-select');
      this.telemetryPill = document.getElementById('search-telemetry-pill');
      this.teamFilterPills = document.querySelectorAll('.team-filter-pill');
      this.sortSelect = document.getElementById('registry-sort-select');
      this.btnAddPlayer = document.getElementById('btn-add-player');
      this.btnResetData = document.getElementById('btn-reset-demo-data');
      this.playerCountBadge = document.getElementById('registry-player-count');

      // Modals
      this.playerFormModal = document.getElementById('modal-player-form');
      this.playerForm = document.getElementById('form-player');
      this.playerModalTitle = document.getElementById('modal-player-title');
      this.inputPlayerId = document.getElementById('input-player-id');
      this.inputPlayerName = document.getElementById('input-player-name');
      this.inputPlayerLevel = document.getElementById('input-player-level');
      this.selectPlayerTeam = document.getElementById('select-player-team');
      this.inputCustomTeam = document.getElementById('input-custom-team');

      this.confirmDeleteModal = document.getElementById('modal-confirm-delete');
      this.btnConfirmDelete = document.getElementById('btn-confirm-delete-action');
      this.deletePlayerNotice = document.getElementById('delete-player-notice');

      this.detailsModal = document.getElementById('modal-player-details');
      this.detailsContent = document.getElementById('player-details-content');

      this.confirmResetModal = document.getElementById('modal-confirm-reset');
      this.btnConfirmReset = document.getElementById('btn-confirm-reset-action');
    },

    bindEvents: function () {
      // Search input live filtering
      if (this.searchInput) {
        this.searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.trim();
          if (this.searchClearBtn) {
            this.searchClearBtn.style.display = this.searchQuery ? 'inline-flex' : 'none';
          }
          this.render();
        });
      }

      // Clear search button
      if (this.searchClearBtn) {
        this.searchClearBtn.addEventListener('click', () => {
          if (this.searchInput) this.searchInput.value = '';
          this.searchQuery = '';
          this.searchClearBtn.style.display = 'none';
          this.render();
        });
      }

      // Algorithm selector change
      if (this.algorithmSelect) {
        this.algorithmSelect.addEventListener('change', (e) => {
          this.selectedAlgorithm = e.target.value;
          this.render();
        });
      }

      // Sort selector change
      if (this.sortSelect) {
        this.sortSelect.addEventListener('change', (e) => {
          this.sortBy = e.target.value;
          this.render();
        });
      }

      // Team filter pills
      this.teamFilterPills.forEach(pill => {
        pill.addEventListener('click', () => {
          this.teamFilterPills.forEach(p => p.classList.remove('is-active'));
          pill.classList.add('is-active');
          this.selectedTeam = pill.getAttribute('data-team') || 'all';
          this.render();
        });
      });

      // Add Player button
      if (this.btnAddPlayer) {
        this.btnAddPlayer.addEventListener('click', () => {
          this.openAddPlayerModal();
        });
      }

      // Reset Demo Data button
      if (this.btnResetData) {
        this.btnResetData.addEventListener('click', () => {
          if (window.GameModal) {
            window.GameModal.open('modal-confirm-reset');
          }
        });
      }

      // Confirm Reset Action
      if (this.btnConfirmReset) {
        this.btnConfirmReset.addEventListener('click', () => {
          if (window.GamePlayerData) {
            window.GamePlayerData.resetDemoData(true);
            if (window.GameModal) window.GameModal.close('modal-confirm-reset');
            if (window.GameToast) window.GameToast.success('Roster reset to original 53 seed players.');
          }
        });
      }

      // Form team selector custom input toggle
      if (this.selectPlayerTeam && this.inputCustomTeam) {
        this.selectPlayerTeam.addEventListener('change', (e) => {
          if (e.target.value === 'CUSTOM') {
            this.inputCustomTeam.style.display = 'block';
            this.inputCustomTeam.focus();
          } else {
            this.inputCustomTeam.style.display = 'none';
          }
        });
      }

      // Player Form Submit (Add or Edit)
      if (this.playerForm) {
        this.playerForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleFormSubmit();
        });
      }

      // Confirm Delete Action
      if (this.btnConfirmDelete) {
        this.btnConfirmDelete.addEventListener('click', () => {
          const playerId = this.btnConfirmDelete.getAttribute('data-player-id');
          if (playerId && window.GamePlayerData) {
            try {
              window.GamePlayerData.delete(Number(playerId));
              if (window.GameModal) window.GameModal.close('modal-confirm-delete');
              if (window.GameToast) window.GameToast.info(`Player #${playerId} removed from roster.`);
            } catch (err) {
              if (window.GameToast) window.GameToast.error(err.message);
            }
          }
        });
      }

      // Table Action delegation (View, Edit, Delete)
      if (this.tableBody) {
        this.tableBody.addEventListener('click', (e) => {
          const btnView = e.target.closest('[data-action="view"]');
          const btnEdit = e.target.closest('[data-action="edit"]');
          const btnDelete = e.target.closest('[data-action="delete"]');

          if (btnView) {
            const id = Number(btnView.getAttribute('data-id'));
            this.showPlayerDetails(id);
          } else if (btnEdit) {
            const id = Number(btnEdit.getAttribute('data-id'));
            this.openEditPlayerModal(id);
          } else if (btnDelete) {
            const id = Number(btnDelete.getAttribute('data-id'));
            this.openDeleteConfirmModal(id);
          }
        });
      }
    },

    subscribeToStore: function () {
      if (window.GamePlayerData && typeof window.GamePlayerData.subscribe === 'function') {
        window.GamePlayerData.subscribe(() => {
          this.render();
        });
      }
    },

    /**
     * Executes algorithmic search and filters
     */
    getFilteredPlayers: function () {
      if (!window.GamePlayerData) return [];
      const allPlayers = window.GamePlayerData.getAll();

      let results = allPlayers;
      let telemetry = {
        algorithm: 'All Records',
        complexity: 'O(1)',
        comparisons: 0,
        timeMs: 0.01,
        matchCount: allPlayers.length
      };

      // 1. Algorithmic Search if query provided
      if (this.searchQuery && window.GamePlayerAlgorithms) {
        const query = this.searchQuery;
        const alg = this.selectedAlgorithm;

        if (alg === 'linear_id') {
          const searchRes = window.GamePlayerAlgorithms.linearSearchById(allPlayers, query);
          results = searchRes.found ? [searchRes.player] : [];
          telemetry = {
            algorithm: 'Linear Search by ID',
            complexity: 'O(N)',
            comparisons: searchRes.comparisons,
            timeMs: searchRes.timeMs,
            matchCount: results.length
          };
        } else if (alg === 'linear_name') {
          const searchRes = window.GamePlayerAlgorithms.linearSearchByName(allPlayers, query);
          results = searchRes.matches;
          telemetry = {
            algorithm: 'Linear Search by Name',
            complexity: 'O(N)',
            comparisons: searchRes.comparisons,
            timeMs: searchRes.timeMs,
            matchCount: results.length
          };
        } else if (alg === 'linear_team') {
          const searchRes = window.GamePlayerAlgorithms.linearSearchByTeam(allPlayers, query);
          results = searchRes.matches;
          telemetry = {
            algorithm: 'Linear Search by Team',
            complexity: 'O(N)',
            comparisons: searchRes.comparisons,
            timeMs: searchRes.timeMs,
            matchCount: results.length
          };
        } else if (alg === 'binary_id') {
          const searchRes = window.GamePlayerAlgorithms.binarySearchById(allPlayers, query);
          results = searchRes.found ? [searchRes.player] : [];
          telemetry = {
            algorithm: 'Binary Search by ID',
            complexity: 'O(log N)',
            comparisons: searchRes.comparisons,
            timeMs: searchRes.timeMs,
            matchCount: results.length
          };
        } else if (alg === 'hash_id') {
          const searchRes = window.GamePlayerAlgorithms.hashMapSearchById(window.GamePlayerData.playerMap, query);
          results = searchRes.found ? [searchRes.player] : [];
          telemetry = {
            algorithm: 'Hash-Map Search by ID',
            complexity: 'O(1)',
            comparisons: searchRes.comparisons,
            timeMs: searchRes.timeMs,
            matchCount: results.length
          };
        }
      }

      this.lastTelemetry = telemetry;

      // 2. Filter by Team Pill if selected
      if (this.selectedTeam !== 'all') {
        const teamFilter = this.selectedTeam.toLowerCase();
        results = results.filter(p => {
          const pTeam = (p.team || '').toLowerCase();
          if (teamFilter === 'noteam' || teamFilter === 'solo') {
            return !p.team || pTeam === 'noteam';
          }
          return pTeam === teamFilter;
        });
      }

      // 3. Sorting
      results.sort((a, b) => {
        if (this.sortBy === 'score_desc') {
          if (b.score !== a.score) return b.score - a.score;
          return a.id - b.id; // Deterministic tie-breaker
        } else if (this.sortBy === 'id_asc') {
          return a.id - b.id;
        } else if (this.sortBy === 'id_desc') {
          return b.id - a.id;
        } else if (this.sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        } else if (this.sortBy === 'level_desc') {
          return b.level - a.level;
        }
        return 0;
      });

      return results;
    },

    render: function () {
      if (!this.tableBody) return;

      const players = this.getFilteredPlayers();

      // Update Player Count Badge
      if (this.playerCountBadge && window.GamePlayerData) {
        const total = window.GamePlayerData.getAll().length;
        this.playerCountBadge.textContent = `${players.length} / ${total} Players`;
      }

      // Update Telemetry Pill
      if (this.telemetryPill && this.lastTelemetry) {
        const t = this.lastTelemetry;
        this.telemetryPill.innerHTML = `
          <span class="telemetry-pill__alg">${t.algorithm}</span>
          <span class="telemetry-pill__complexity">${t.complexity}</span>
          <span class="telemetry-pill__metric"><strong>${t.comparisons}</strong> comps</span>
          <span class="telemetry-pill__metric"><strong>${t.timeMs}</strong>ms</span>
          <span class="telemetry-pill__metric"><strong>${t.matchCount}</strong> matched</span>
        `;
      }

      // Render Table Rows
      if (players.length === 0) {
        this.tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="table-placeholder-cell">
              <div class="empty-state" style="padding: var(--space-8) 0;">
                <span class="empty-state__icon" aria-hidden="true">🔍</span>
                <h3 class="empty-state__title">No Matching Players Found</h3>
                <p class="empty-state__desc">Try adjusting your search criteria, algorithm, or team filter.</p>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      const escapeHTML = window.GamePlayerData.escapeHTML;

      const rowsHTML = players.map(player => {
        const teamBadge = this.getTeamBadgeHTML(player.team);
        const tierBadge = this.getTierBadgeHTML(player.score);

        return `
          <tr data-row-id="${player.id}">
            <td>
              <span class="player-id-badge font-mono">#${player.id}</span>
            </td>
            <td>
              <div class="player-handle-cell">
                <span class="player-avatar-circle" aria-hidden="true">${escapeHTML(player.name.charAt(0).toUpperCase())}</span>
                <div class="player-handle-info">
                  <span class="player-handle-name">${escapeHTML(player.name)}</span>
                  <span class="player-handle-tier">${tierBadge}</span>
                </div>
              </div>
            </td>
            <td>${teamBadge}</td>
            <td>
              <span class="player-level-badge font-mono">LVL ${player.level}</span>
            </td>
            <td>
              <span class="player-score-cell font-mono">
                <strong class="score-val">${player.score}</strong>
                <span class="score-unit">PTS</span>
              </span>
            </td>
            <td>
              <div class="table-actions">
                <button type="button" class="btn-action btn-action--view" data-action="view" data-id="${player.id}" title="View Player Profile" aria-label="View player ${escapeHTML(player.name)} profile">
                  👁️
                </button>
                <button type="button" class="btn-action btn-action--edit" data-action="edit" data-id="${player.id}" title="Edit Player" aria-label="Edit player ${escapeHTML(player.name)}">
                  ✏️
                </button>
                <button type="button" class="btn-action btn-action--delete" data-action="delete" data-id="${player.id}" title="Delete Player" aria-label="Delete player ${escapeHTML(player.name)}">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      this.tableBody.innerHTML = rowsHTML;
    },

    getTeamBadgeHTML: function (team) {
      const escapeHTML = window.GamePlayerData.escapeHTML;
      const cleanTeam = (team || 'NoTeam').trim();

      if (cleanTeam === 'NoTeam' || cleanTeam === '-' || cleanTeam === 'null') {
        return '<span class="team-badge team-badge--solo">👤 Solo</span>';
      } else if (cleanTeam.toLowerCase() === 'warriors') {
        return '<span class="team-badge team-badge--warriors">⚔️ Warriors</span>';
      } else if (cleanTeam.toLowerCase() === 'knights') {
        return '<span class="team-badge team-badge--knights">🛡️ Knights</span>';
      } else if (cleanTeam.toLowerCase() === 'dragons') {
        return '<span class="team-badge team-badge--dragons">🐉 Dragons</span>';
      } else if (cleanTeam.toLowerCase() === 'klh') {
        return '<span class="team-badge team-badge--klh">🏛️ KLH</span>';
      }

      return `<span class="team-badge team-badge--custom">⚡ ${escapeHTML(cleanTeam)}</span>`;
    },

    getTierBadgeHTML: function (score) {
      if (score >= 100) return '<span class="tier-chip tier-chip--grandmaster">Grandmaster</span>';
      if (score >= 90) return '<span class="tier-chip tier-chip--master">Master</span>';
      if (score >= 80) return '<span class="tier-chip tier-chip--diamond">Diamond</span>';
      if (score >= 70) return '<span class="tier-chip tier-chip--platinum">Platinum</span>';
      if (score >= 60) return '<span class="tier-chip tier-chip--gold">Gold</span>';
      return '<span class="tier-chip tier-chip--challenger">Challenger</span>';
    },

    openAddPlayerModal: function () {
      if (!this.playerForm) return;
      this.playerForm.reset();
      this.playerForm.removeAttribute('data-edit-id');
      if (this.playerModalTitle) this.playerModalTitle.textContent = 'Register New Player';

      // Enable and auto-generate next ID
      if (this.inputPlayerId) {
        this.inputPlayerId.disabled = false;
        this.inputPlayerId.readOnly = false;
        const all = window.GamePlayerData ? window.GamePlayerData.getAll() : [];
        const nextId = all.length > 0 ? Math.max(...all.map(p => p.id)) + 1 : 101;
        this.inputPlayerId.value = nextId;
      }

      if (this.inputCustomTeam) this.inputCustomTeam.style.display = 'none';

      if (window.GameModal) window.GameModal.open('modal-player-form');
    },

    openEditPlayerModal: function (id) {
      if (!window.GamePlayerData) return;
      const player = window.GamePlayerData.getById(id);
      if (!player) return;

      this.playerForm.reset();
      this.playerForm.setAttribute('data-edit-id', id);
      if (this.playerModalTitle) this.playerModalTitle.textContent = `Edit Player #${id}`;

      // ID cannot be modified per specification
      if (this.inputPlayerId) {
        this.inputPlayerId.value = player.id;
        this.inputPlayerId.disabled = true;
      }

      if (this.inputPlayerName) {
        this.inputPlayerName.value = player.name;
      }

      if (this.inputPlayerLevel) {
        this.inputPlayerLevel.value = player.level;
      }

      if (this.selectPlayerTeam) {
        const knownTeams = ['NoTeam', 'Warriors', 'Knights', 'Dragons', 'KLH'];
        if (knownTeams.includes(player.team)) {
          this.selectPlayerTeam.value = player.team;
          if (this.inputCustomTeam) this.inputCustomTeam.style.display = 'none';
        } else {
          this.selectPlayerTeam.value = 'CUSTOM';
          if (this.inputCustomTeam) {
            this.inputCustomTeam.style.display = 'block';
            this.inputCustomTeam.value = player.team;
          }
        }
      }

      if (window.GameModal) window.GameModal.open('modal-player-form');
    },

    openDeleteConfirmModal: function (id) {
      if (!window.GamePlayerData) return;
      const player = window.GamePlayerData.getById(id);
      if (!player) return;

      if (this.btnConfirmDelete) {
        this.btnConfirmDelete.setAttribute('data-player-id', id);
      }

      if (this.deletePlayerNotice) {
        this.deletePlayerNotice.textContent = `Are you sure you want to remove ${player.name} (#${player.id}) from the active roster? This action is immediate.`;
      }

      if (window.GameModal) window.GameModal.open('modal-confirm-delete');
    },

    showPlayerDetails: function (id) {
      if (!window.GamePlayerData) return;
      const player = window.GamePlayerData.getById(id);
      if (!player || !this.detailsContent) return;

      const rankedList = window.GamePlayerData.getRanked();
      const rankIdx = rankedList.findIndex(p => p.id === id);
      const currentRank = rankIdx !== -1 ? `#${rankIdx + 1}` : 'Unranked';

      const escapeHTML = window.GamePlayerData.escapeHTML;

      this.detailsContent.innerHTML = `
        <div class="player-card-profile">
          <div class="player-card-profile__header">
            <span class="player-card-profile__avatar">${escapeHTML(player.name.charAt(0).toUpperCase())}</span>
            <div class="player-card-profile__title-box">
              <h3 class="player-card-profile__name">${escapeHTML(player.name)}</h3>
              <div class="player-card-profile__badges">
                <span class="player-id-badge font-mono">ID: #${player.id}</span>
                ${this.getTeamBadgeHTML(player.team)}
                ${this.getTierBadgeHTML(player.score)}
              </div>
            </div>
          </div>

          <div class="player-card-profile__metrics-grid">
            <div class="profile-metric-box">
              <span class="profile-metric-label">Leaderboard Rank</span>
              <span class="profile-metric-val font-mono" style="color: var(--color-accent);">${currentRank}</span>
            </div>
            <div class="profile-metric-box">
              <span class="profile-metric-label">Rating Score</span>
              <span class="profile-metric-val font-mono" style="color: var(--color-amber);">${player.score} PTS</span>
            </div>
            <div class="profile-metric-box">
              <span class="profile-metric-label">Player Level</span>
              <span class="profile-metric-val font-mono" style="color: var(--color-cyan);">LVL ${player.level}</span>
            </div>
            <div class="profile-metric-box">
              <span class="profile-metric-label">Affiliation</span>
              <span class="profile-metric-val font-mono">${escapeHTML(player.team)}</span>
            </div>
          </div>

          <div class="player-card-profile__meta font-mono" style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: var(--space-4); border-top: 1px solid var(--color-border-subtle); padding-top: var(--space-3);">
            Record registered: ${player.createdAt ? new Date(player.createdAt).toLocaleString() : 'Seed Dataset'}
          </div>
        </div>
      `;

      if (window.GameModal) window.GameModal.open('modal-player-details');
    },

    handleFormSubmit: function () {
      if (!window.GamePlayerData) return;

      const editId = this.playerForm.getAttribute('data-edit-id');
      const isEditing = Boolean(editId);

      const name = this.inputPlayerName ? this.inputPlayerName.value.trim() : '';
      const level = this.inputPlayerLevel ? Number(this.inputPlayerLevel.value) : 1;

      let team = 'NoTeam';
      if (this.selectPlayerTeam) {
        if (this.selectPlayerTeam.value === 'CUSTOM') {
          team = (this.inputCustomTeam ? this.inputCustomTeam.value.trim() : '') || 'NoTeam';
        } else {
          team = this.selectPlayerTeam.value;
        }
      }

      try {
        if (isEditing) {
          const targetId = Number(editId);
          window.GamePlayerData.update(targetId, {
            name: name,
            level: level,
            team: team
          });

          if (window.GameModal) window.GameModal.close('modal-player-form');
          if (window.GameToast) window.GameToast.success(`Player #${targetId} updated successfully.`);
        } else {
          const id = this.inputPlayerId ? Number(this.inputPlayerId.value) : 0;
          window.GamePlayerData.add({
            id: id,
            name: name,
            level: level,
            team: team,
            score: 0 // New players initialize to 0 per Java spec
          });

          if (window.GameModal) window.GameModal.close('modal-player-form');
          if (window.GameToast) window.GameToast.success(`Player "${name}" (#${id}) registered to roster!`);
        }
      } catch (err) {
        if (window.GameToast) {
          window.GameToast.error(err.message);
        } else {
          alert(err.message);
        }
      }
    }
  };

  window.GamePlayerManager = PlayerManager;

})(typeof window !== 'undefined' ? window : global, typeof document !== 'undefined' ? document : null);
