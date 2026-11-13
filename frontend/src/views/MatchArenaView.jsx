import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/common/ConfirmModal';

export default function MatchArenaView() {
  const { showToast } = useToast();
  const [queue, setQueue] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [rolling, setRolling] = useState(false);
  const [lastMatchResult, setLastMatchResult] = useState(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [slotBank, setSlotBank] = useState(0);

  const QUEUE_CAPACITY = 50;

  // Load queue and available players
  const loadData = async () => {
    try {
      setLoading(true);
      const [qData, pData] = await Promise.all([
        api.getQueue().catch(() => []),
        api.getPlayers().catch(() => []),
      ]);
      setQueue(qData || []);
      setAllPlayers(pData || []);
      if (pData && pData.length > 0 && !selectedPlayerId) {
        setSelectedPlayerId(String(pData[0].id));
      }
    } catch (err) {
      showToast(`Failed to load arena data: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Join lobby
  const handleJoinQueue = async () => {
    if (!selectedPlayerId) {
      showToast('Please select a player to join the matchmaking lobby.', 'error');
      return;
    }
    try {
      await api.joinQueue(parseInt(selectedPlayerId, 10));
      showToast(`Player #${selectedPlayerId} entered the matchmaking lobby!`, 'success');
      await loadData();
    } catch (err) {
      showToast(`Join failed: ${err.message}`, 'error');
    }
  };

  // Leave lobby
  const handleLeaveQueue = async (playerId) => {
    try {
      await api.leaveQueue(playerId);
      showToast(`Player #${playerId} removed from lobby.`, 'info');
      await loadData();
    } catch (err) {
      showToast(`Leave failed: ${err.message}`, 'error');
    }
  };

  // Clear lobby
  const handleClearQueue = async () => {
    try {
      await api.clearQueue();
      showToast('Matchmaking lobby cleared.', 'info');
      setIsClearModalOpen(false);
      await loadData();
    } catch (err) {
      showToast(`Clear failed: ${err.message}`, 'error');
    }
  };

  // Play Solo Match (1v1)
  const handlePlaySolo = async () => {
    if (queue.length < 2) {
      showToast('Need at least 2 players in the lobby for a 1v1 match.', 'error');
      return;
    }

    try {
      setRolling(true);
      setLastMatchResult(null);
      // Brief visual suspense delay
      await new Promise((r) => setTimeout(r, 600));
      const result = await api.playSoloMatch();
      setLastMatchResult(result);
      showToast(`Match #${result.matchId} complete! Winner: ${result.winnerName} (+10 PTS)`, 'success');
      await loadData();
    } catch (err) {
      showToast(`Solo match failed: ${err.message}`, 'error');
    } finally {
      setRolling(false);
    }
  };

  // Play Team Match (2v2)
  const handlePlayTeam = async () => {
    if (queue.length < 4) {
      showToast('Need at least 4 players in the lobby for a 2v2 match.', 'error');
      return;
    }

    try {
      setRolling(true);
      setLastMatchResult(null);
      await new Promise((r) => setTimeout(r, 600));
      const result = await api.playTeamMatch();
      setLastMatchResult(result);
      showToast(`Match #${result.matchId} complete! Winner: ${result.winnerName} (+10 PTS each)`, 'success');
      await loadData();
    } catch (err) {
      showToast(`Team match failed: ${err.message}`, 'error');
    } finally {
      setRolling(false);
    }
  };

  // Identify players already in queue
  const queuedIds = new Set(queue.map((entry) => (entry.player ? entry.player.id : entry.playerId)));
  const availablePlayers = allPlayers.filter((p) => !queuedIds.has(p.id));

  // Quick Seed 4 Contenders into Queue
  const handleQuickSeed4 = async () => {
    if (availablePlayers.length < 4) {
      showToast('At least 4 available contenders are required to quick seed.', 'error');
      return;
    }
    if (queue.length + 4 > QUEUE_CAPACITY) {
      showToast(`Cannot seed 4 players: only ${QUEUE_CAPACITY - queue.length} slots remaining.`, 'error');
      return;
    }

    try {
      setLoading(true);
      for (let i = 0; i < 4; i++) {
        await api.joinQueue(availablePlayers[i].id);
      }
      showToast('Enrolled 4 contenders into the matchmaking lobby!', 'success');
      await loadData();
    } catch (err) {
      showToast(`Quick seed failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 10 slots per bank across 5 banks (0..49)
  const bankStart = slotBank * 10;
  const circularSlots = Array.from({ length: 10 }, (_, i) => {
    const slotIndex = bankStart + i;
    const occupant = queue.find((q) => q.slotIndex === slotIndex);
    return {
      slotIndex,
      occupant,
    };
  });

  // Calculate occupants per bank
  const bankCounts = [0, 1, 2, 3, 4].map((b) => {
    const start = b * 10;
    const end = start + 9;
    return queue.filter((q) => q.slotIndex >= start && q.slotIndex <= end).length;
  });

  return (
    <section id="view-arena" className="view-panel is-active" aria-labelledby="arena-title">
      <header className="page-header">
        <div className="page-header__meta">
          <span className="badge badge--lime">Combat Matchmaking</span>
          <span className="badge badge--cyan">Circular FIFO Queue (Cap 50)</span>
          <span className="badge badge--magenta">Authoritative Dice Engine</span>
        </div>
        <h1 id="arena-title" className="page-title">
          Esports Match Arena &amp; Combat Lobby
        </h1>
        <p className="page-description">
          Enroll contenders into the bounded circular matchmaking queue (modulo arithmetic wrap-around)
          and trigger authoritative 1v1 solo or 2v2 team combat powered by the Java dice roll engine.
        </p>
      </header>

      {/* CIRCULAR QUEUE CAPACITY VISUALIZER */}
      <div style={{ background: 'var(--color-surface, #12161A)', border: '1px solid var(--color-border, #2A323D)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.15rem' }}>
              Circular Queue Ring Buffer (Capacity: 50)
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Occupancy: {queue.length} / 50 • Head index wraps via <code>(head + 1) % 50</code>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn--outline"
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', borderColor: 'var(--color-accent, #00F5D4)', color: 'var(--color-accent, #00F5D4)' }}
              disabled={queue.length + 4 > QUEUE_CAPACITY || availablePlayers.length < 4}
              onClick={handleQuickSeed4}
              title="Automatically queue 4 available players for fast testing"
            >
              ⚡ Quick Seed 4
            </button>
            <button
              type="button"
              className="btn btn--outline"
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', borderColor: '#ff4757', color: '#ff4757' }}
              disabled={queue.length === 0}
              onClick={() => setIsClearModalOpen(true)}
            >
              Clear Lobby
            </button>
          </div>
        </div>

        {/* Bank Selector Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {[0, 1, 2, 3, 4].map((b) => (
            <button
              key={b}
              type="button"
              className={`btn ${slotBank === b ? 'btn--primary' : 'btn--outline'}`}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
              onClick={() => setSlotBank(b)}
            >
              Bank {b + 1} (Slots {b * 10}–{b * 10 + 9})
              {bankCounts[b] > 0 && (
                <span
                  style={{
                    marginLeft: '0.4rem',
                    backgroundColor: slotBank === b ? '#000' : 'rgba(0, 245, 212, 0.2)',
                    color: slotBank === b ? '#00F5D4' : '#fff',
                    borderRadius: '10px',
                    padding: '0.05rem 0.35rem',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                  }}
                >
                  {bankCounts[b]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Ring Buffer Slot Slots */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))', gap: '0.75rem' }}>
          {circularSlots.map(({ slotIndex, occupant }) => (
            <div
              key={slotIndex}
              style={{
                backgroundColor: occupant ? 'rgba(0, 245, 212, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: occupant ? '1px solid var(--color-accent, #00F5D4)' : '1px dashed var(--color-border, #2A323D)',
                borderRadius: '8px',
                padding: '0.75rem 0.5rem',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                Slot {slotIndex}
              </div>
              {occupant ? (
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-accent, #00F5D4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {occupant.player ? occupant.player.name : occupant.playerName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    #{occupant.player ? occupant.player.id : occupant.playerId}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.2)', padding: '0.25rem 0' }}>
                  EMPTY
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* LOBBY CONTROLS & ENROLLED PLAYERS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Join Queue Controls */}
        <div style={{ background: 'var(--color-surface, #12161A)', border: '1px solid var(--color-border, #2A323D)', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontFamily: 'var(--font-heading)', fontSize: '1.15rem' }}>
            Queue Contender for Matchmaking
          </h3>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              Select Contender (Available: {availablePlayers.length})
            </label>
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              disabled={queue.length >= QUEUE_CAPACITY || availablePlayers.length === 0}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: '#0C0F12',
                border: '1px solid #2A323D',
                color: '#fff',
                fontSize: '0.9rem',
              }}
            >
              {availablePlayers.length === 0 ? (
                <option value="">No contenders available</option>
              ) : (
                availablePlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} — {p.name} ({p.score} PTS, {p.team || 'NoTeam'})
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            type="button"
            className="btn btn--primary"
            style={{ width: '100%' }}
            disabled={queue.length >= QUEUE_CAPACITY || availablePlayers.length === 0}
            onClick={handleJoinQueue}
          >
            {queue.length >= QUEUE_CAPACITY ? 'Lobby Full (50/50)' : '+ Enroll into Matchmaking Lobby'}
          </button>
        </div>

        {/* Combat Dispatch Stage */}
        <div style={{ background: 'var(--color-surface, #12161A)', border: '1px solid var(--color-border, #2A323D)', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontFamily: 'var(--font-heading)', fontSize: '1.15rem' }}>
            Initiate Authoritative Combat
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Combat is executed via <code>MatchService.java</code>. Each player rolls a virtual 6-sided die.
            Winner receives <strong>+10 PTS</strong> permanently updated in the database and logged to the LIFO undo stack.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--primary"
              style={{ flex: 1, minWidth: '130px', padding: '0.75rem' }}
              disabled={queue.length < 2 || rolling}
              onClick={handlePlaySolo}
            >
              {rolling ? '🎲 Rolling...' : '⚔️ Play 1v1 Solo'}
            </button>
            <button
              type="button"
              className="btn btn--outline"
              style={{ flex: 1, minWidth: '130px', padding: '0.75rem', borderColor: 'var(--color-secondary, #F15BB5)', color: 'var(--color-secondary, #F15BB5)' }}
              disabled={queue.length < 4 || rolling}
              onClick={handlePlayTeam}
            >
              {rolling ? '🎲 Rolling...' : '🛡️ Play 2v2 Team'}
            </button>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
            {queue.length < 2
              ? 'Enroll at least 2 players to enable 1v1 combat.'
              : queue.length < 4
              ? '1v1 ready. Enroll 2 more players for 2v2 team combat.'
              : 'Both 1v1 and 2v2 combat modes ready!'}
          </div>
        </div>
      </div>

      {/* LATEST MATCH OUTCOME BANNER */}
      {lastMatchResult && (
        <div
          style={{
            background: 'var(--color-surface-raised, #181E24)',
            border: '2px solid var(--color-primary, #B8F34B)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 32px rgba(184, 243, 75, 0.1)',
            animation: 'fadeIn 0.3s ease-in',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="badge badge--lime">Combat Result • Match #{lastMatchResult.matchId}</span>
            <span className="badge badge--neutral font-mono">{lastMatchResult.matchType} Mode</span>
          </div>

          {(() => {
            const winner = lastMatchResult.winnerName || (lastMatchResult.participants && lastMatchResult.participants.length > 0 ? lastMatchResult.participants.filter(p => p.isWinner).map(p => p.playerName).join(' & ') : lastMatchResult.winningSide);
            const p1 = lastMatchResult.participants && lastMatchResult.participants[0];
            const p2 = lastMatchResult.participants && lastMatchResult.participants[1];
            const p1Name = lastMatchResult.player1Name || (p1 ? p1.playerName : 'Squad Alpha');
            const p2Name = lastMatchResult.player2Name || (p2 ? p2.playerName : 'Squad Omega');
            const p1Roll = lastMatchResult.player1Roll ?? (p1 ? p1.diceRoll : '-');
            const p2Roll = lastMatchResult.player2Roll ?? (p2 ? p2.diceRoll : '-');

            return (
              <>
                <h2 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)', color: '#FFD700', fontSize: '1.5rem' }}>
                  🏆 Victory: {winner} (+10 Points Awarded)
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Contenders / Teams</div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.25rem' }}>
                      {p1Name} vs {p2Name}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Dice Roll Scores</div>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--color-accent, #00F5D4)', marginTop: '0.25rem' }}>
                      🎲 {p1Roll} to {p2Roll}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Status</div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-primary, #B8F34B)', marginTop: '0.25rem' }}>
                      {lastMatchResult.status} (Push to LIFO Stack)
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* LOBBY TABLE */}
      <div style={{ overflowX: 'auto', background: 'var(--color-surface, #12161A)', border: '1px solid var(--color-border, #2A323D)', borderRadius: '12px' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border, #2A323D)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
            Current Matchmaking Lobby FIFO Order
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {queue.length} Contenders Enqueued
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border, #2A323D)', background: 'var(--color-surface-raised, #181E24)' }}>
              <th style={{ padding: '0.85rem 1rem' }}>FIFO Position</th>
              <th style={{ padding: '0.85rem 1rem' }}>Ring Slot</th>
              <th style={{ padding: '0.85rem 1rem' }}>Contender</th>
              <th style={{ padding: '0.85rem 1rem' }}>ID</th>
              <th style={{ padding: '0.85rem 1rem' }}>Current Score</th>
              <th style={{ padding: '0.85rem 1rem' }}>Team</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Loading lobby status...
                </td>
              </tr>
            ) : queue.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Matchmaking lobby is currently empty. Enroll contenders above to begin combat.
                </td>
              </tr>
            ) : (
              queue.map((entry, index) => {
                const pId = entry.player ? entry.player.id : entry.playerId;
                const pName = entry.player ? entry.player.name : entry.playerName;
                const pScore = entry.player ? entry.player.score : entry.playerScore;
                const pTeam = entry.player ? entry.player.team : entry.playerTeam;
                return (
                  <tr key={entry.id || pId} style={{ borderBottom: '1px solid rgba(42, 50, 61, 0.4)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {index === 0 ? '👑 Head (Next Up)' : `#${index + 1}`}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent, #00F5D4)' }}>
                      Slot {entry.slotIndex}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                      {pName}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                      #{pId}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--color-primary, #B8F34B)' }}>
                      {pScore} PTS
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge badge--neutral">{pTeam || 'NoTeam'}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn--outline"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderColor: '#ff4757', color: '#ff4757' }}
                        onClick={() => handleLeaveQueue(pId)}
                      >
                        Leave Lobby
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={isClearModalOpen}
        title="Clear Matchmaking Lobby?"
        message="This will remove all waiting contenders from the queue. No player scores will be affected."
        confirmText="Clear Lobby"
        isDanger={true}
        onConfirm={handleClearQueue}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </section>
  );
}
