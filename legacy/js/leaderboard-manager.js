/**
 * GAME LEADERBOARD - RANKED LEADERBOARD MANAGER
 * Orchestrates the Ranked Leaderboard view (#view-leaderboard):
 * - Dynamic Top-3 Podium (Rank 1 Electric Lime, Rank 2 Cyber Magenta, Rank 3 Neon Cyan)
 * - Full QuickSort rankings table strictly matching Java `PlayerArray.leaderboardQuick()`
 * - Deterministic tie-breaking on equal score using ascending player ID
 * - Real-time subscription to PlayerStore changes
 */

(function (window, document) {
  'use strict';

  const LeaderboardManager = {
    searchQuery: '',
    selectedTeam: 'all',

    init: function () {
      this.cacheElements();
      this.bindEvents();
      this.subscribeToStore();
      this.render();
    },

    cacheElements: function () {
      this.podiumStep1 = document.getElementById('podium-rank-1');
      this.podiumStep2 = document.getElementById('podium-rank-2');
      this.podiumStep3 = document.getElementById('podium-rank-3');
      this.tableBody = document.getElementById('leaderboard-table-body');
      this.searchInput = document.getElementById('leaderboard-search-input');
      this.teamFilterPills = document.querySelectorAll('.leaderboard-team-pill');
      this.leaderboardMeta = document.getElementById('leaderboard-meta-info');
    },

    bindEvents: function () {
      // Live search filter inside leaderboard
      if (this.searchInput) {
        this.searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.trim().toLowerCase();
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
    },

    subscribeToStore: function () {
      if (window.GamePlayerData && typeof window.GamePlayerData.subscribe === 'function') {
        window.GamePlayerData.subscribe(() => {
          this.render();
        });
      }
    },

    /**
     * Retrieves ranked players and applies UI search/team filters
     */
    getRankedPlayers: function () {
      if (!window.GamePlayerData) return [];
      const ranked = window.GamePlayerData.getRanked();

      let filtered = ranked;

      // Filter by Team if selected
      if (this.selectedTeam !== 'all') {
        const teamFilter = this.selectedTeam.toLowerCase();
        filtered = filtered.filter(p => {
          const pTeam = (p.team || '').toLowerCase();
          if (teamFilter === 'noteam' || teamFilter === 'solo') {
            return !p.team || pTeam === 'noteam';
          }
          return pTeam === teamFilter;
        });
      }

      // Filter by Search Query
      if (this.searchQuery) {
        const q = this.searchQuery;
        filtered = filtered.filter(p => {
          const matchName = p.name.toLowerCase().includes(q);
          const matchId = String(p.id).includes(q);
          const matchTeam = (p.team || '').toLowerCase().includes(q);
          return matchName || matchId || matchTeam;
        });
      }

      return {
        allRanked: ranked,
        displayed: filtered
      };
    },

    render: function () {
      const data = this.getRankedPlayers();
      this.renderPodium(data.allRanked);
      this.renderTable(data.displayed, data.allRanked.length);
    },

    /**
     * Renders Top-3 Podium based on global leaderboard standings
     */
    renderPodium: function (ranked) {
      const escapeHTML = window.GamePlayerData ? window.GamePlayerData.escapeHTML : str => str;

      // Rank 1
      if (this.podiumStep1) {
        const p1 = ranked[0];
        if (p1) {
          this.podiumStep1.innerHTML = `
            <div class="podium-rank-badge podium-rank-badge--1" aria-label="Rank 1">👑 #1</div>
            <div class="podium-avatar-wrap">
              <span class="podium-avatar podium-avatar--1">${escapeHTML(p1.name.charAt(0).toUpperCase())}</span>
            </div>
            <div class="podium-player-name">${escapeHTML(p1.name)}</div>
            <div class="podium-player-sub">
              <span class="player-id-badge font-mono">#${p1.id}</span>
              <span class="podium-team-tag">${escapeHTML(p1.team)}</span>
            </div>
            <div class="podium-score podium-score--1 font-mono">${p1.score} PTS</div>
            <span class="badge badge--lime podium-tier-badge">Grandmaster</span>
          `;
        } else {
          this.podiumStep1.innerHTML = `
            <div class="podium-rank-badge podium-rank-badge--1">👑 #1</div>
            <div class="podium-player-name">Vacant</div>
            <div class="podium-score">-- PTS</div>
          `;
        }
      }

      // Rank 2
      if (this.podiumStep2) {
        const p2 = ranked[1];
        if (p2) {
          this.podiumStep2.innerHTML = `
            <div class="podium-rank-badge podium-rank-badge--2" aria-label="Rank 2">🥈 #2</div>
            <div class="podium-avatar-wrap">
              <span class="podium-avatar podium-avatar--2">${escapeHTML(p2.name.charAt(0).toUpperCase())}</span>
            </div>
            <div class="podium-player-name">${escapeHTML(p2.name)}</div>
            <div class="podium-player-sub">
              <span class="player-id-badge font-mono">#${p2.id}</span>
              <span class="podium-team-tag">${escapeHTML(p2.team)}</span>
            </div>
            <div class="podium-score podium-score--2 font-mono">${p2.score} PTS</div>
            <span class="badge badge--magenta podium-tier-badge">Rank 2 Seat</span>
          `;
        } else {
          this.podiumStep2.innerHTML = `
            <div class="podium-rank-badge podium-rank-badge--2">#2</div>
            <div class="podium-player-name">Vacant</div>
            <div class="podium-score">-- PTS</div>
          `;
        }
      }

      // Rank 3
      if (this.podiumStep3) {
        const p3 = ranked[2];
        if (p3) {
          this.podiumStep3.innerHTML = `
            <div class="podium-rank-badge podium-rank-badge--3" aria-label="Rank 3">🥉 #3</div>
            <div class="podium-avatar-wrap">
              <span class="podium-avatar podium-avatar--3">${escapeHTML(p3.name.charAt(0).toUpperCase())}</span>
            </div>
            <div class="podium-player-name">${escapeHTML(p3.name)}</div>
            <div class="podium-player-sub">
              <span class="player-id-badge font-mono">#${p3.id}</span>
              <span class="podium-team-tag">${escapeHTML(p3.team)}</span>
            </div>
            <div class="podium-score podium-score--3 font-mono">${p3.score} PTS</div>
            <span class="badge badge--cyan podium-tier-badge">Rank 3 Seat</span>
          `;
        } else {
          this.podiumStep3.innerHTML = `
            <div class="podium-rank-badge podium-rank-badge--3">#3</div>
            <div class="podium-player-name">Vacant</div>
            <div class="podium-score">-- PTS</div>
          `;
        }
      }
    },

    /**
     * Renders Leaderboard Table
     */
    renderTable: function (players, totalRanked) {
      if (!this.tableBody) return;

      if (this.leaderboardMeta) {
        this.leaderboardMeta.textContent = `Showing ${players.length} of ${totalRanked} ranked contenders • QuickSort Lomuto Partition`;
      }

      if (players.length === 0) {
        this.tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="table-placeholder-cell">
              <div class="empty-state" style="padding: var(--space-8) 0;">
                <span class="empty-state__icon" aria-hidden="true">🏆</span>
                <h3 class="empty-state__title">No Leaderboard Entries Match</h3>
                <p class="empty-state__desc">Try clearing the search query or changing team filter pills.</p>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      const escapeHTML = window.GamePlayerData ? window.GamePlayerData.escapeHTML : str => str;

      const rowsHTML = players.map(player => {
        let rankBadgeClass = 'rank-num';
        let rankContent = `#${player.rank}`;

        if (player.rank === 1) {
          rankBadgeClass = 'rank-pill rank-pill--1';
          rankContent = '👑 1';
        } else if (player.rank === 2) {
          rankBadgeClass = 'rank-pill rank-pill--2';
          rankContent = '🥈 2';
        } else if (player.rank === 3) {
          rankBadgeClass = 'rank-pill rank-pill--3';
          rankContent = '🥉 3';
        }

        const teamBadge = this.getTeamBadgeHTML(player.team);
        const tierBadge = this.getTierBadgeHTML(player.score);

        return `
          <tr class="${player.rank <= 3 ? 'leaderboard-row--top3' : ''}">
            <td>
              <span class="${rankBadgeClass} font-mono">${rankContent}</span>
            </td>
            <td>
              <div class="player-handle-cell">
                <span class="player-avatar-circle ${player.rank === 1 ? 'player-avatar-circle--gold' : ''}" aria-hidden="true">
                  ${escapeHTML(player.name.charAt(0).toUpperCase())}
                </span>
                <div class="player-handle-info">
                  <span class="player-handle-name">${escapeHTML(player.name)}</span>
                  <span class="player-id-badge font-mono" style="font-size: 0.72rem;">#${player.id}</span>
                </div>
              </div>
            </td>
            <td>${teamBadge}</td>
            <td>
              <span class="player-level-badge font-mono">LVL ${player.level}</span>
            </td>
            <td>
              <span class="player-score-cell font-mono ${player.rank === 1 ? 'player-score-cell--gold' : ''}">
                <strong class="score-val">${player.score}</strong>
                <span class="score-unit">PTS</span>
              </span>
            </td>
            <td>${tierBadge}</td>
          </tr>
        `;
      }).join('');

      this.tableBody.innerHTML = rowsHTML;
    },

    getTeamBadgeHTML: function (team) {
      const escapeHTML = window.GamePlayerData ? window.GamePlayerData.escapeHTML : str => str;
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
    }
  };

  window.GameLeaderboardManager = LeaderboardManager;

})(typeof window !== 'undefined' ? window : global, typeof document !== 'undefined' ? document : null);
