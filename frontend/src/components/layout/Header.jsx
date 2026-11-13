import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

const VIEW_TITLES = {
  overview: 'Arena Overview',
  registry: 'Player Registry',
  leaderboard: 'Ranked Standings',
  arena: 'Combat Arena',
  history: 'Match History',
  'dsa-lab': 'DSA Algorithm Lab',
};

export default function Header({ currentView, onToggleSidebar }) {
  const [backendStatus, setBackendStatus] = useState('CHECKING');
  const [currentTime, setCurrentTime] = useState('');

  // Clock updater
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Health check ping
  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        const data = await api.getHealth();
        if (mounted) {
          if (data && data.status === 'UP') {
            setBackendStatus('CONNECTED');
          } else {
            setBackendStatus('DEGRADED');
          }
        }
      } catch (err) {
        if (mounted) {
          setBackendStatus('OFFLINE');
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="app-header" role="banner">
      <div className="header-left">
        <button
          type="button"
          id="btn-mobile-menu"
          className="btn-mobile-menu"
          aria-label="Toggle navigation menu"
          onClick={onToggleSidebar}
        >
          <span aria-hidden="true">☰</span>
        </button>

        <nav className="breadcrumb-trail" aria-label="Breadcrumb">
          <span className="breadcrumb-root">RANKFORGE</span>
          <span className="breadcrumb-sep" aria-hidden="true">/</span>
          <span id="breadcrumb-current" className="breadcrumb-current">
            {VIEW_TITLES[currentView] || 'Console'}
          </span>
        </nav>
      </div>

      <div className="header-right">
        <span
          className={`badge ${
            backendStatus === 'CONNECTED'
              ? 'badge--lime'
              : backendStatus === 'CHECKING'
              ? 'badge--neutral'
              : 'badge--magenta'
          }`}
          title="Spring Boot REST API Health Status"
        >
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: backendStatus === 'CONNECTED' ? '#B8F34B' : '#F15BB5',
              marginRight: '6px',
            }}
          />
          Backend: {backendStatus}
        </span>
        <span className="badge badge--cyan">Full-Stack Esports Engine</span>
        <div id="header-clock" className="badge badge--neutral font-mono" title="System Local Time">
          {currentTime || '--:--:--'}
        </div>
      </div>
    </header>
  );
}
