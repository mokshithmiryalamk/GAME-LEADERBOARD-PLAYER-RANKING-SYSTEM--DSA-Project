import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/common/ConfirmModal';

export default function OverviewView({ onNavigate }) {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState({
    playerCount: 53,
    quarantinedCount: 1,
    queueSize: 0,
    totalMatches: 0,
    activeStackDepth: 0,
    databaseEngine: 'H2 Persistent',
  });
  const [champion, setChampion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [health, leaderboard] = await Promise.all([
        api.getHealth().catch(() => null),
        api.getLeaderboard({ limit: 1 }).catch(() => []),
      ]);

      if (health) {
        setMetrics({
          playerCount: health.playerCount ?? 53,
          quarantinedCount: health.quarantinedCount ?? 1,
          queueSize: health.queueSize ?? 0,
          totalMatches: health.totalMatches ?? 0,
          activeStackDepth: health.activeStackDepth ?? 0,
          databaseEngine: health.databaseEngine ?? 'H2 Persistent',
        });
      }

      if (leaderboard && leaderboard.length > 0) {
        setChampion(leaderboard[0]);
      } else {
        setChampion(null);
      }
    } catch (err) {
      console.error('Failed to load overview data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetRoster = async () => {
    try {
      setIsResetting(true);
      const res = await api.resetDemoData();
      showToast(res.message || 'Roster successfully restored to authentic 53 seed records!', 'success');
      setIsResetModalOpen(false);
      await loadData();
    } catch (err) {
      showToast(`Reset failed: ${err.message}`, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <section id="view-overview" className="view-panel is-active" aria-labelledby="overview-title">
      <header className="page-header">
        <div className="page-header__meta">
          <span className="badge badge--lime">Executive Mission Dashboard</span>
          <span className="badge badge--cyan">Full-Stack Esports Engine</span>
          <span className="badge badge--neutral">Core DSA Architecture</span>
        </div>
        <h1 id="overview-title" className="page-title">
          RANKFORGE — Player Rankings &amp; Match Arena
        </h1>
        <p className="page-description">
          An interactive, high-performance esports operations console powered by a modern React 19 + Vite frontend
          and an authoritative Java Spring Boot 3 backend. Built upon authentic Data Structures &amp; Algorithms
          principles from the original academic Java project.
        </p>
      </header>

      {/* Full-Stack Architecture Notice */}
      <div className="stage-notice" role="region" aria-label="System Notice">
        <span className="stage-notice__icon" aria-hidden="true">⚡</span>
        <div>
          <h2 className="stage-notice__title">Full-Stack Esports Engine Operational</h2>
          <p className="stage-notice__body">
            All sorting (QuickSort Lomuto), queuing (Circular Queue with modulo wrap-around), combat simulation (Authoritative Dice Engine),
            and transaction-safe undo stacks (LIFO Match History) are strictly calculated by the compiled Java Spring Boot backend
            backed by persistent database storage.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', margin: '2rem 0' }}>
        <div className="metric-card" style={{ background: 'var(--color-surface, #12161A)', border: '1px solid var(--color-border, #2A323D)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Roster</span>
            <span style={{ fontSize: '1.4rem' }}>👥</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-primary, #B8F34B)' }}>
            {loading ? '...' : metrics.playerCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {metrics.quarantinedCount} malformed record safely quarantined
          </div>
        </div>

        <div className="metric-card" style={{ background: 'var(--color-surface, #12161A)', border: '1px solid var(--color-border, #2A323D)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Matchmaking Queue</span>
            <span style={{ fontSize: '1.4rem' }}>⏳</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-accent, #00F5D4)' }}>
            {loading ? '...' : `${metrics.queueSize} / 50`}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Circular FIFO Queue (Capacity 50)
          </div>
        </div>

        <div className="metric-card" style={{ background: 'var(--color-surface, #12161A)', border: '1px solid var(--color-border, #2A323D)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Matches Completed</span>
            <span style={{ fontSize: '1.4rem' }}>⚔️</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-secondary, #F15BB5)' }}>
            {loading ? '...' : metrics.totalMatches}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Active Undo Stack Depth: {metrics.activeStackDepth}
          </div>
        </div>

        <div className="metric-card" style={{ background: 'var(--color-surface, #12161A)', border: '1px solid var(--color-border, #2A323D)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Arena Champion</span>
            <span style={{ fontSize: '1.4rem' }}>👑</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#FFD700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {loading ? '...' : champion ? champion.name : 'No Contenders'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {champion ? `${champion.score} PTS • ${champion.team} • Lvl ${champion.level}` : 'Roster empty'}
          </div>
        </div>
      </div>

      {/* Featured Champion Spotlight & Quick Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Spotlight Card */}
        <div style={{ background: 'var(--color-surface, #12161A)', border: '1px solid var(--color-border, #2A323D)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span className="badge badge--lime">Rank #1 Leader</span>
              <span className="badge badge--neutral">Live Standings</span>
            </div>
            {champion ? (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: '#FFD700' }}>
                  {champion.name} <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>#{champion.id}</span>
                </h3>
                <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                  Leading the global leaderboard with <strong>{champion.score} Points</strong>. Representing Team{' '}
                  <span className="badge badge--cyan">{champion.team}</span> at Contender Level {champion.level}.
                </p>
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)' }}>No champion data available.</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn--primary" onClick={() => onNavigate('leaderboard')}>
              View Full Standings ➔
            </button>
            <button className="btn btn--outline" onClick={() => onNavigate('arena')}>
              Enter Arena ⚔️
            </button>
          </div>
        </div>

        {/* System & Architecture Blueprint */}
        <div style={{ background: 'var(--color-surface, #12161A)', border: '1px solid var(--color-border, #2A323D)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span className="badge badge--cyan">System Integrity</span>
              <span className="badge badge--neutral">Academic Heritage</span>
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }}>
              Java DSA Engine &amp; Canonical Seed
            </h3>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Original source files preserved byte-for-byte in <code>original-source/</code> matching Git blob hash <code>9997165</code>.
              Seed data originates directly from <code>players.txt</code> (53 valid players, 1 line quarantined).
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn--outline" onClick={() => onNavigate('dsa-lab')}>
              Explore 7 DSA Labs 🔬
            </button>
            <button
              className="btn btn--outline"
              style={{ borderColor: 'var(--color-secondary, #F15BB5)', color: 'var(--color-secondary, #F15BB5)' }}
              onClick={() => setIsResetModalOpen(true)}
            >
              Reset Demo Roster 🔄
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isResetModalOpen}
        title="Reset Roster to Canonical 53 Seed Records?"
        message="This will re-initialize the database from authentic players.txt, restoring 53 valid player records, clearing all matchmaking queue entries, and resetting match history. This action cannot be undone."
        confirmText={isResetting ? "Resetting..." : "Confirm Reset"}
        isDanger={true}
        onConfirm={handleResetRoster}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </section>
  );
}
