import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/common/ConfirmModal';

export default function MatchHistoryView() {
  const { showToast } = useToast();
  const [matches, setMatches] = useState([]);
  const [activeStackDepth, setActiveStackDepth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isUndoModalOpen, setIsUndoModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [undoing, setUndoing] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const [historyData, healthData] = await Promise.all([
        api.getMatchHistory({ status: statusFilter }),
        api.getHealth().catch(() => null),
      ]);
      setMatches(historyData || []);
      if (healthData) {
        setActiveStackDepth(healthData.activeStackDepth ?? 0);
      }
    } catch (err) {
      showToast(`Failed to load match history: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [statusFilter]);

  // Execute Atomic Undo
  const handleUndo = async () => {
    try {
      setUndoing(true);
      const result = await api.undoLastMatch();
      showToast(
        `Match #${result.matchId} successfully reversed! (${result.winnerName} -${result.scoreDeducted} PTS)`,
        'success'
      );
      setIsUndoModalOpen(false);
      await loadHistory();
    } catch (err) {
      showToast(`Undo failed: ${err.message}`, 'error');
    } finally {
      setUndoing(false);
    }
  };

  return (
    <section id="view-history" className="view-panel is-active" aria-labelledby="history-title">
      <header className="page-header">
        <div className="page-header__meta">
          <span className="badge badge--lime">Audit Trail &amp; Telemetry</span>
          <span className="badge badge--cyan">LIFO Stack (MatchHistoryStack.java)</span>
          <span className="badge badge--magenta">Atomic Transaction Undo</span>
        </div>
        <h1 id="history-title" className="page-title">
          Combat History &amp; Transaction-Safe Undo
        </h1>
        <p className="page-description">
          Every completed combat is recorded into a persistent LIFO stack. The system supports genuine,
          atomic score reversals that decrement awarded points and mark records as UNDONE in strict reverse order.
        </p>
      </header>

      {/* LIFO STACK MONITOR BANNER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--color-surface, #12161A)', border: '1px solid var(--color-border, #2A323D)', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Active LIFO Stack Depth
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-accent, #00F5D4)', marginTop: '0.25rem' }}>
              {activeStackDepth} Reversible
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              Matches available for atomic rollback
            </div>
          </div>
          <button
            type="button"
            className="btn btn--primary"
            style={{ padding: '0.75rem 1.25rem', backgroundColor: '#F15BB5', borderColor: '#F15BB5', color: '#0C0F12', fontWeight: 700 }}
            disabled={activeStackDepth === 0 || undoing}
            onClick={() => setIsUndoModalOpen(true)}
          >
            {undoing ? 'Reversing...' : '↩️ Atomic Undo Last Match'}
          </button>
        </div>

        <div style={{ background: 'var(--color-surface, #12161A)', border: '1px solid var(--color-border, #2A323D)', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Stack Rollback Guarantees
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
            Reversals are bounded by database transactions. Only the most recent <code>COMPLETED</code> match
            at the top of the stack can be undone. If any contender was removed or conflict exists, rollback is safely rejected.
          </p>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['ALL', 'COMPLETED', 'UNDONE'].map((st) => (
          <button
            key={st}
            type="button"
            className={`btn ${statusFilter === st ? 'btn--primary' : 'btn--outline'}`}
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
            onClick={() => setStatusFilter(st)}
          >
            {st === 'ALL' ? 'All Matches' : st}
          </button>
        ))}
      </div>

      {/* MATCH HISTORY TABLE */}
      <div style={{ overflowX: 'auto', background: 'var(--color-surface, #12161A)', border: '1px solid var(--color-border, #2A323D)', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border, #2A323D)', background: 'var(--color-surface-raised, #181E24)' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Match ID</th>
              <th style={{ padding: '0.85rem 1rem' }}>Timestamp</th>
              <th style={{ padding: '0.85rem 1rem' }}>Mode</th>
              <th style={{ padding: '0.85rem 1rem' }}>Combatants</th>
              <th style={{ padding: '0.85rem 1rem' }}>Rolls</th>
              <th style={{ padding: '0.85rem 1rem' }}>Winner</th>
              <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Dossier</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Loading combat history from database...
                </td>
              </tr>
            ) : matches.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No match records found. Play a match in the Combat Arena to generate history.
                </td>
              </tr>
            ) : (
              matches.map((m) => {
                const isUndone = m.status === 'UNDONE';
                const p1 = m.participants && m.participants[0];
                const p2 = m.participants && m.participants[1];
                const p1Name = m.player1Name || (p1 ? p1.playerName : 'Squad Alpha');
                const p2Name = m.player2Name || (p2 ? p2.playerName : 'Squad Omega');
                const p1Roll = m.player1Roll ?? (p1 ? p1.diceRoll : '-');
                const p2Roll = m.player2Roll ?? (p2 ? p2.diceRoll : '-');
                const winner = m.winnerName || (m.participants && m.participants.length > 0 ? m.participants.filter(p => p.isWinner).map(p => p.playerName).join(' & ') : (m.summary || m.winningSide));
                const timeVal = m.playedAt || m.timestamp;

                return (
                  <tr
                    key={m.matchId}
                    style={{
                      borderBottom: '1px solid rgba(42, 50, 61, 0.4)',
                      opacity: isUndone ? 0.6 : 1,
                      backgroundColor: isUndone ? 'rgba(255, 71, 87, 0.03)' : undefined,
                    }}
                  >
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-accent, #00F5D4)' }}>
                      #{m.matchId}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {timeVal ? new Date(timeVal).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge badge--neutral">{m.matchType}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                      {p1Name} vs {p2Name}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)' }}>
                      🎲 {p1Roll} - {p2Roll}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: isUndone ? 'var(--color-text-muted)' : '#FFD700', fontWeight: 600 }}>
                      {winner} {isUndone ? '(Reversed)' : '(+10 PTS)'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${isUndone ? 'badge--neutral' : 'badge--lime'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn--outline"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        onClick={() => setSelectedMatch(m)}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* DOSSIER MODAL */}
      {selectedMatch && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setSelectedMatch(null)}
        >
          <div
            className="modal-card"
            style={{
              backgroundColor: 'var(--color-surface, #12161A)',
              border: '1px solid var(--color-border, #2A323D)',
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>
                Combat Dossier #{selectedMatch.matchId}
              </h3>
              <span className={`badge ${selectedMatch.status === 'UNDONE' ? 'badge--neutral' : 'badge--lime'}`}>
                {selectedMatch.status}
              </span>
            </div>

            {(() => {
              const p1 = selectedMatch.participants && selectedMatch.participants[0];
              const p2 = selectedMatch.participants && selectedMatch.participants[1];
              const p1Name = selectedMatch.player1Name || (p1 ? p1.playerName : 'Squad Alpha');
              const p2Name = selectedMatch.player2Name || (p2 ? p2.playerName : 'Squad Omega');
              const p1Roll = selectedMatch.player1Roll ?? (p1 ? p1.diceRoll : '-');
              const p2Roll = selectedMatch.player2Roll ?? (p2 ? p2.diceRoll : '-');
              const winner = selectedMatch.winnerName || (selectedMatch.participants && selectedMatch.participants.length > 0 ? selectedMatch.participants.filter(p => p.isWinner).map(p => p.playerName).join(' & ') : (selectedMatch.summary || selectedMatch.winningSide));
              const timeVal = selectedMatch.playedAt || selectedMatch.timestamp;

              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ background: '#0C0F12', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Match Type</div>
                      <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{selectedMatch.matchType} Mode</div>
                    </div>
                    <div style={{ background: '#0C0F12', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Timestamp</div>
                      <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>
                        {timeVal ? new Date(timeVal).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#0C0F12', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                      Combatants &amp; Dice Outcomes
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span>{p1Name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-accent, #00F5D4)' }}>
                        🎲 Roll: {p1Roll}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{p2Name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-accent, #00F5D4)' }}>
                        🎲 Roll: {p2Roll}
                      </span>
                    </div>
                  </div>

                  <div style={{ background: '#0C0F12', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                      Awarded Winner
                    </div>
                    <div style={{ fontWeight: 700, color: '#FFD700', fontSize: '1.1rem' }}>
                      {winner}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                      {selectedMatch.status === 'UNDONE'
                        ? 'Score addition (+10 PTS) was reversed via LIFO stack rollback.'
                        : 'Active score increment (+10 PTS) credited to player record.'}
                    </div>
                  </div>
                </>
              );
            })()}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn--primary" onClick={() => setSelectedMatch(null)}>
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM UNDO MODAL */}
      <ConfirmModal
        isOpen={isUndoModalOpen}
        title="Undo Latest Combat Match?"
        message="This will pop the latest match from the LIFO history stack, decrement 10 points from the winner's authoritative database score, and mark the match record as UNDONE."
        confirmText={undoing ? "Undoing..." : "Confirm Rollback"}
        isDanger={true}
        onConfirm={handleUndo}
        onCancel={() => setIsUndoModalOpen(false)}
      />
    </section>
  );
}
