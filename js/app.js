/**
 * GAME LEADERBOARD & PLAYER RANKING SYSTEM - APPLICATION COORDINATOR
 * Stage 1: Responsive Navigation, Hash Routing, Mobile Drawer & Clock
 */

(function (window, document) {
  'use strict';

  const VIEWS = {
    'overview': {
      title: 'Arena Overview',
      id: 'view-overview',
      navId: 'nav-overview'
    },
    'registry': {
      title: 'Player Registry',
      id: 'view-registry',
      navId: 'nav-registry'
    },
    'leaderboard': {
      title: 'Ranked Leaderboard',
      id: 'view-leaderboard',
      navId: 'nav-leaderboard'
    },
    'arena': {
      title: 'Match Arena',
      id: 'view-arena',
      navId: 'nav-arena'
    },
    'history': {
      title: 'Match History',
      id: 'view-history',
      navId: 'nav-history'
    },
    'dsa-lab': {
      title: 'DSA Algorithm Lab',
      id: 'view-dsa-lab',
      navId: 'nav-dsa-lab'
    }
  };

  let currentView = 'overview';

  const App = {
    init: function () {
      this.cacheDOMElements();
      this.bindEvents();
      this.initClock();
      this.initStage2Modules();
      this.syncOverviewKPIs();
      this.handleInitialHash();
    },

    cacheDOMElements: function () {
      this.sidebar = document.getElementById('app-sidebar');
      this.backdrop = document.getElementById('nav-backdrop');
      this.mobileMenuBtn = document.getElementById('btn-mobile-menu');
      this.breadcrumbCurrent = document.getElementById('breadcrumb-current');
      this.clockEl = document.getElementById('header-clock');
      this.navLinks = document.querySelectorAll('.sidebar-nav .nav-item');
      this.viewPanels = document.querySelectorAll('.view-panel');

      // Overview KPI Card elements (defensive check for test environments without querySelector)
      const qs = (sel) => (typeof document.querySelector === 'function' ? document.querySelector(sel) : null);
      this.kpiTotalPlayersVal = qs('#kpi-total-players .stat-card__val');
      this.kpiTotalPlayersSub = qs('#kpi-total-players .stat-card__subtext');
      this.kpiActiveLobbyVal = qs('#kpi-active-lobby .stat-card__val');
      this.kpiActiveLobbySub = qs('#kpi-active-lobby .stat-card__subtext');
      this.kpiMatchesPlayedVal = qs('#kpi-matches-played .stat-card__val');
      this.kpiMatchesPlayedSub = qs('#kpi-matches-played .stat-card__subtext');
      this.kpiTopScoreVal = qs('#kpi-top-score .stat-card__val');
      this.kpiTopScoreSub = qs('#kpi-top-score .stat-card__subtext');
    },

    initStage2Modules: function () {
      if (window.GamePlayerManager && typeof window.GamePlayerManager.init === 'function') {
        window.GamePlayerManager.init();
      }
      if (window.GameLeaderboardManager && typeof window.GameLeaderboardManager.init === 'function') {
        window.GameLeaderboardManager.init();
      }
      if (window.GameArenaManager && typeof window.GameArenaManager.init === 'function') {
        window.GameArenaManager.init();
      }
      if (window.GameHistoryManager && typeof window.GameHistoryManager.init === 'function') {
        window.GameHistoryManager.init();
      }
      if (window.GameDSALab && typeof window.GameDSALab.init === 'function') {
        window.GameDSALab.init();
      }

      if (window.GamePlayerData && typeof window.GamePlayerData.subscribe === 'function') {
        window.GamePlayerData.subscribe(() => {
          this.syncOverviewKPIs();
        });
      }

      if (window.GameMatchQueue && typeof window.GameMatchQueue.subscribe === 'function') {
        window.GameMatchQueue.subscribe(() => {
          this.syncOverviewKPIs();
        });
      }

      if (window.GameMatchData && typeof window.GameMatchData.subscribe === 'function') {
        window.GameMatchData.subscribe(() => {
          this.syncOverviewKPIs();
        });
      }
    },

    syncOverviewKPIs: function () {
      if (!window.GamePlayerData || typeof window.GamePlayerData.getMetrics !== 'function') {
        return;
      }

      const metrics = window.GamePlayerData.getMetrics();

      if (this.kpiTotalPlayersVal) {
        this.kpiTotalPlayersVal.textContent = metrics.totalPlayers;
      }
      if (this.kpiTotalPlayersSub) {
        this.kpiTotalPlayersSub.textContent = `${metrics.teamPlayers} in Teams • ${metrics.soloPlayers} Solo`;
      }

      // Lobby Queue KPI
      if (this.kpiActiveLobbyVal && window.GameMatchQueue) {
        this.kpiActiveLobbyVal.textContent = window.GameMatchQueue.size();
      }
      if (this.kpiActiveLobbySub && window.GameMatchQueue) {
        this.kpiActiveLobbySub.textContent = `Lobby Capacity: ${window.GameMatchQueue.capacity} Challengers`;
      }

      // Matches Completed KPI (Active vs Undone count)
      if (this.kpiMatchesPlayedVal && window.GameMatchData) {
        const activeCount = typeof window.GameMatchData.getActiveCompletedCount === 'function'
          ? window.GameMatchData.getActiveCompletedCount()
          : window.GameMatchData.getCompletedCount();
        this.kpiMatchesPlayedVal.textContent = activeCount;
      }
      if (this.kpiMatchesPlayedSub && window.GameMatchData) {
        const activeCount = typeof window.GameMatchData.getActiveCompletedCount === 'function'
          ? window.GameMatchData.getActiveCompletedCount()
          : window.GameMatchData.getCompletedCount();
        const undoneCount = typeof window.GameMatchData.getUndoneCount === 'function'
          ? window.GameMatchData.getUndoneCount()
          : 0;
        this.kpiMatchesPlayedSub.textContent = undoneCount > 0
          ? `${activeCount} Active • ${undoneCount} Undone`
          : `${activeCount} Matches Completed`;
      }

      if (this.kpiTopScoreVal) {
        this.kpiTopScoreVal.textContent = metrics.highestScore;
      }
      if (this.kpiTopScoreSub) {
        if (metrics.topPlayer) {
          const teamLabel = metrics.topPlayer.team === 'NoTeam' ? 'Solo' : metrics.topPlayer.team;
          this.kpiTopScoreSub.textContent = `Champion: ${metrics.topPlayer.name} (${teamLabel})`;
        } else {
          this.kpiTopScoreSub.textContent = 'No scores recorded';
        }
      }
    },

    bindEvents: function () {
      // Sidebar Nav item clicks
      this.navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetView = link.getAttribute('data-view');
          if (targetView && VIEWS[targetView]) {
            this.switchView(targetView);
          }
        });
      });

      // Quick-view links inside content
      document.addEventListener('click', (e) => {
        const quickLink = e.target.closest('[data-quickview]');
        if (quickLink) {
          e.preventDefault();
          const targetView = quickLink.getAttribute('data-quickview');
          if (targetView && VIEWS[targetView]) {
            this.switchView(targetView);
          }
        }
      });

      // Mobile Menu Button
      if (this.mobileMenuBtn) {
        this.mobileMenuBtn.addEventListener('click', () => {
          this.toggleMobileMenu();
        });
      }

      // Backdrop click to close drawer
      if (this.backdrop) {
        this.backdrop.addEventListener('click', () => {
          this.closeMobileMenu();
        });
      }

      // Keyboard Esc to close mobile menu
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.sidebar && this.sidebar.classList.contains('is-open')) {
          this.closeMobileMenu();
        }
      });

      // Browser History / Hash Navigation
      window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '').trim();
        if (hash && VIEWS[hash] && hash !== currentView) {
          this.switchView(hash, false);
        }
      });
    },

    switchView: function (viewName, updateHash = true) {
      if (!VIEWS[viewName]) {
        viewName = 'overview';
      }

      currentView = viewName;
      const targetConfig = VIEWS[viewName];

      // 1. Hide all view panels, activate current
      this.viewPanels.forEach((panel) => {
        panel.classList.remove('is-active');
      });
      const activePanel = document.getElementById(targetConfig.id);
      if (activePanel) {
        activePanel.classList.add('is-active');
      }

      // 2. Update navigation item active states
      this.navLinks.forEach((link) => {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      });
      const activeNav = document.getElementById(targetConfig.navId);
      if (activeNav) {
        activeNav.classList.add('is-active');
        activeNav.setAttribute('aria-current', 'page');
      }

      // 3. Update breadcrumbs
      if (this.breadcrumbCurrent) {
        this.breadcrumbCurrent.textContent = targetConfig.title;
      }

      // 4. Update browser URL hash
      if (updateHash && window.location.hash !== `#${viewName}`) {
        window.location.hash = `#${viewName}`;
      }

      // 5. Scroll to top of main content container
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // 6. Close mobile drawer if open
      this.closeMobileMenu();
    },

    toggleMobileMenu: function () {
      if (!this.sidebar) return;
      const isOpen = this.sidebar.classList.contains('is-open');
      if (isOpen) {
        this.closeMobileMenu();
      } else {
        this.openMobileMenu();
      }
    },

    openMobileMenu: function () {
      if (this.sidebar) this.sidebar.classList.add('is-open');
      if (this.backdrop) this.backdrop.classList.add('is-visible');
      if (this.mobileMenuBtn) {
        this.mobileMenuBtn.setAttribute('aria-expanded', 'true');
      }
    },

    closeMobileMenu: function () {
      if (this.sidebar) this.sidebar.classList.remove('is-open');
      if (this.backdrop) this.backdrop.classList.remove('is-visible');
      if (this.mobileMenuBtn) {
        this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    },

    initClock: function () {
      const updateClock = () => {
        if (!this.clockEl) return;
        const now = new Date();
        this.clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
      };
      updateClock();
      setInterval(updateClock, 1000);
    },

    handleInitialHash: function () {
      const initialHash = window.location.hash.replace('#', '').trim();
      if (initialHash && VIEWS[initialHash]) {
        this.switchView(initialHash, false);
      } else {
        this.switchView('overview', false);
      }
    },

    // Public Inspection Helpers
    getCurrentView: function () {
      return currentView;
    },

    getConfiguredViews: function () {
      return Object.keys(VIEWS);
    }
  };

  // Expose to window for testing and coordination
  window.GameLeaderboardApp = App;

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }

})(window, document);
