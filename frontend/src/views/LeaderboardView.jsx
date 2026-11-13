import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

const TEAMS = ['All', 'Warriors', 'Knights', 'Dragons', 'NoTeam'];
const LIMITS = [
  { label: 'All Contenders', value: 0 },
  { label: 'Top 5', value: 5 },
  { label: 'Top 10', value: 10 },
  { label: 'Top 25', value: 25 },
];

export default function LeaderboardView() {
  const { showToast } = useToast();
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState('All');
  const [limit, setLimit] = useState(0);

  const fetchStandings = async () => {
    try {
      setLoading(true);
      const data = await api.getLeaderboard({ team: selectedTeam, limit });
      setStandings(data || []);
    } catch (err) {
      showToast(`Failed to load leaderboard: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings();
  }, [selectedTeam, limit]);

  const top3 = standings.slice(0, 3);
  const top1 = top3[0];
  const top2 = top3[1];
  const top3rd = top3[2];

  return (
    <section id="view-leaderboard" className="view-panel is-active" aria-labelledby="leaderboard-title">
      <header className="page-header">
        <div className="page-header__meta">
          <span className="badge badge--lime">Live Ranked Standings</span>
          <span className="badge badge--cyan">Java QuickSort Lomuto</span>
        </div>
        <h1 id="leaderboard-title" className="page-title">
          Esports Ranked Leaderboard
        </h1>
        <p className="page-description">
          Authoritative player standings ordered by total points using genuine Java-executed QuickSort
          with Lomuto partitioning directly ported from <code>PlayerArray.java</code>.
        </p>
      </header>

      {/* QuickSort Architecture Card */}
      <div className="stage-notice" style={{ marginBottom: '2rem' }}>
        <span className="stage-notice__icon">⚡</span>
        <div>
          <h3 className="stage-notice__title">Authoritative QuickSort Algorithm In Use</h3>
          <p className="stage-notice__body">
            Standings are computed server-side in <code>LeaderboardService.java</code>. No client-side array sorting is performed.
            Tie-breaks favor higher contender level followed by ascending unique ID.
          </p>
        </div>
      </div>

      {/* Top 3 Podium (Visible if at least 2 contenders exist) */}
      {standings.length >= 2 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            alignItems: 'end',
            marginBottom: '2.5rem',
          }}
        >
          {/* Silver - Rank 2 */}
          {top2 && (
            <div
              style={{
                background: 'var(--color-surface, #12161A)',
                border: '1px solid #94A3B8',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#94A3B8',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  padding: '2px 10px',
                  borderRadius: '12px',
                }}
              >
                #2 SILVER
              </div>
              <div style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>🥈</div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }}>
                {top2.name}
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>ID #{top2.id}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent, #00F5D4)', margin: '0.5rem 0' }}>
                {top2.score} PTS
              </div>
              <span className="badge badge--neutral">{top2.team || 'NoTeam'} • Lvl {top2.level}</span>
            </div>
          )}

          {/* Gold - Rank 1 (Taller, featured) */}
          {top1 && (
            <div
              style={{
                background: 'var(--color-surface-raised, #181E24)',
                border: '2px solid #FFD700',
                borderRadius: '12px',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 8px 30px rgba(255, 215, 0, 0.15)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#FFD700',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  padding: '3px 14px',
                  borderRadius: '12px',
                }}
              >
                👑 #1 CHAMPION
              </div>
              <div style={{ fontSize: '3rem', margin: '0.5rem 0' }}>🥇</div>
              <h2 style={{ margin: '0 0 0.25rem 0', fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: '#FFD700' }}>
                {top1.name}
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>ID #{top1.id}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary, #B8F34B)', margin: '0.5rem 0' }}>
                {top1.score} PTS
              </div>
              <span className="badge badge--cyan">{top1.team || 'NoTeam'} • Lvl {top1.level}</span>
            </div>
          )}

          {/* Bronze - Rank 3 */}
          {top3rd && (
            <div
              style={{
                background: 'var(--color-surface, #12161A)',
                border: '1px solid #CD7F32',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#CD7F32',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  padding: '2px 10px',
                  borderRadius: '12px',
                }}
              >
                #3 BRONZE
              </div>
              <div style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>🥉</div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }}>
                {top3rd.name}
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>ID #{top3rd.id}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-secondary, #F15BB5)', margin: '0.5rem 0' }}>
                {top3rd.score} PTS
              </div>
              <span className="badge badge--neutral">{top3rd.team || 'NoTeam'} • Lvl {top3rd.level}</span>
            </div>
          )}
        </div>
      )}

      {/* Filters and Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {TEAMS.map((team) => (
            <button
              key={team}
              type="button"
              className={`btn ${selectedTeam === team ? 'btn--primary' : 'btn--outline'}`}
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
              onClick={() => setSelectedTeam(team)}
            >
              {team}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Show:</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: 'var(--color-surface, #12161A)',
              border: '1px solid var(--color-border, #2A323D)',
              color: 'var(--color-text-main, #F1F5F9)',
              fontSize: '0.85rem',
            }}
          >
            {LIMITS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Standings Table */}
      <div style={{ overflowX: 'auto', background: 'var(--color-surface, #12161A)', border: '1px solid var(--color-border, #2A323D)', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border, #2A323D)', background: 'var(--color-surface-raised, #181E24)' }}>
              <th style={{ padding: '0.85rem 1rem', width: '80px' }}>Rank</th>
              <th style={{ padding: '0.85rem 1rem' }}>Contender</th>
              <th style={{ padding: '0.85rem 1rem' }}>ID</th>
              <th style={{ padding: '0.85rem 1rem' }}>Points</th>
              <th style={{ padding: '0.85rem 1rem' }}>Level</th>
              <th style={{ padding: '0.85rem 1rem' }}>Team</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Diff vs #1</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Calculating QuickSort standings from Java backend...
                </td>
              </tr>
            ) : standings.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No contenders on the leaderboard.
                </td>
              </tr>
            ) : (
              standings.map((entry, index) => {
                const rank = index + 1;
                const diff = top1 ? entry.score - top1.score : 0;
                return (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: '1px solid rgba(42, 50, 61, 0.4)',
                      background: rank === 1 ? 'rgba(255, 215, 0, 0.04)' : undefined,
                    }}
                  >
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {rank === 1 ? '🥇 #1' : rank === 2 ? '🥈 #2' : rank === 3 ? '🥉 #3' : `#${rank}`}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                      {entry.name}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                      #{entry.id}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--color-primary, #B8F34B)', fontWeight: 700 }}>
                      {entry.score} PTS
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge badge--neutral">Lvl {entry.level}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${entry.team === 'Warriors' ? 'badge--cyan' : entry.team === 'Knights' ? 'badge--magenta' : entry.team === 'Dragons' ? 'badge--lime' : 'badge--neutral'}`}>
                        {entry.team || 'NoTeam'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: diff === 0 ? 'var(--color-primary, #B8F34B)' : 'var(--color-text-muted)' }}>
                      {diff === 0 ? 'LEADER' : `${diff} PTS`}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
