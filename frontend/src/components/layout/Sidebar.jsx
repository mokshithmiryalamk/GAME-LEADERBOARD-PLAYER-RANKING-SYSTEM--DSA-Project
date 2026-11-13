import React from 'react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Arena Overview', icon: '📊', badge: 'Core', section: 'console' },
  { id: 'registry', label: 'Player Registry', icon: '👥', badge: 'Roster', section: 'console' },
  { id: 'leaderboard', label: 'Ranked Standings', icon: '🏆', badge: 'Ranked', section: 'console' },
  { id: 'arena', label: 'Combat Arena', icon: '⚔️', badge: 'Lobby', section: 'console' },
  { id: 'history', label: 'Match History', icon: '📜', badge: 'Audit', section: 'console' },
  { id: 'dsa-lab', label: 'DSA Lab', icon: '🔬', badge: 'Interactive', section: 'algo' },
];

export default function Sidebar({ currentView, onViewChange, isOpen, onClose }) {
  const handleNavClick = (viewId, e) => {
    e.preventDefault();
    onViewChange(viewId);
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          id="nav-backdrop"
          className="nav-backdrop is-active"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      <aside
        id="app-sidebar"
        className={`app-sidebar ${isOpen ? 'is-open' : ''}`}
        aria-label="Main Navigation"
      >
        <div className="sidebar-header">
          <div className="brand-icon" aria-hidden="true">⚔️</div>
          <div className="brand-info">
            <span className="brand-title">RANKFORGE</span>
            <span className="brand-subtitle">Player Rankings &amp; Match Arena</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Primary Views">
          <span className="nav-section-title">Operations Console</span>

          {NAV_ITEMS.filter((item) => item.section === 'console').map((item) => {
            const isActive = currentView === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-item ${isActive ? 'is-active' : ''}`}
                id={`nav-${item.id}`}
                data-view={item.id}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => handleNavClick(item.id, e)}
              >
                <span className="nav-item__icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
                <span className="nav-item__badge">{item.badge}</span>
              </a>
            );
          })}

          <span className="nav-section-title">Algorithms &amp; Education</span>

          {NAV_ITEMS.filter((item) => item.section === 'algo').map((item) => {
            const isActive = currentView === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-item ${isActive ? 'is-active' : ''}`}
                id={`nav-${item.id}`}
                data-view={item.id}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => handleNavClick(item.id, e)}
              >
                <span className="nav-item__icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
                <span className="nav-item__badge">{item.badge}</span>
              </a>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="system-status">
            <span className="status-dot" aria-hidden="true"></span>
            <span>Full-Stack Engine Online</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
            SHA: 9997165 (Pinned)
          </div>
        </div>
      </aside>
    </>
  );
}
