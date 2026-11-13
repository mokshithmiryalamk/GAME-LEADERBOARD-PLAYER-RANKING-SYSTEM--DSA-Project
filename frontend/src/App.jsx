import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import OverviewView from './views/OverviewView';
import PlayerRegistryView from './views/PlayerRegistryView';
import LeaderboardView from './views/LeaderboardView';
import MatchArenaView from './views/MatchArenaView';
import MatchHistoryView from './views/MatchHistoryView';
import DsaLabView from './views/DsaLabView';

function MainApp() {
  const [currentView, setCurrentView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['overview', 'registry', 'leaderboard', 'arena', 'history', 'dsa-lab'].includes(hash)) {
        setCurrentView(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (viewId) => {
    setCurrentView(viewId);
    window.location.hash = `#${viewId}`;
  };

  return (
    <div className="app-layout">
      <Sidebar
        currentView={currentView}
        onViewChange={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="app-main">
        <Header
          currentView={currentView}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main id="main-content" className="content-container">
          {currentView === 'overview' && <OverviewView onNavigate={handleNavigate} />}
          {currentView === 'registry' && <PlayerRegistryView />}
          {currentView === 'leaderboard' && <LeaderboardView />}
          {currentView === 'arena' && <MatchArenaView />}
          {currentView === 'history' && <MatchHistoryView />}
          {currentView === 'dsa-lab' && <DsaLabView />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
