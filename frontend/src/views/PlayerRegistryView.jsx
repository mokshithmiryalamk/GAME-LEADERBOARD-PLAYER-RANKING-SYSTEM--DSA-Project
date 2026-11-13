import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/common/ConfirmModal';

const TEAMS = ['All', 'Warriors', 'Knights', 'Dragons', 'NoTeam'];

export default function PlayerRegistryView() {
  const { showToast } = useToast();
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('All');

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activePlayer, setActivePlayer] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    score: 0,
    level: 1,
    team: 'Warriors',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const data = await api.getPlayers();
      setPlayers(data || []);
    } catch (err) {
      showToast(`Failed to load players: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let result = [...players];

    if (selectedTeam !== 'All') {
      result = result.filter(
        (p) => (p.team || 'NoTeam').toLowerCase() === selectedTeam.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          String(p.id).includes(q) ||
          (p.team && p.team.toLowerCase().includes(q))
      );
    }

    setFilteredPlayers(result);
  }, [players, searchQuery, selectedTeam]);

  // Open Add modal
  const handleOpenAdd = () => {
    setFormData({
      id: '',
      name: '',
      score: 0,
      level: 1,
      team: 'Warriors',
    });
    setIsAddOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (player) => {
    setActivePlayer(player);
    setFormData({
      id: player.id,
      name: player.name,
      score: player.score,
      level: player.level,
      team: player.team,
    });
    setIsEditOpen(true);
  };

  // Open Delete modal
  const handleOpenDelete = (player) => {
    setActivePlayer(player);
    setIsDeleteOpen(true);
  };

  // Handle Add Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id || !formData.name) {
      showToast('Please provide both Player ID and Name.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const newPlayer = {
        id: parseInt(formData.id, 10),
        name: formData.name.trim(),
        score: parseInt(formData.score, 10) || 0,
        level: parseInt(formData.level, 10) || 1,
        team: formData.team || 'NoTeam',
      };
      await api.createPlayer(newPlayer);
      showToast(`Contender ${newPlayer.name} (#${newPlayer.id}) successfully registered!`, 'success');
      setIsAddOpen(false);
      await fetchPlayers();
    } catch (err) {
      showToast(`Registration failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Name is required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const updates = {
        name: formData.name.trim(),
        level: parseInt(formData.level, 10) || 1,
        team: formData.team || 'NoTeam',
      };
      await api.updatePlayer(activePlayer.id, updates);
      showToast(`Contender #${activePlayer.id} updated successfully!`, 'success');
      setIsEditOpen(false);
      await fetchPlayers();
    } catch (err) {
      showToast(`Update failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Submit
  const handleDeleteConfirm = async () => {
    if (!activePlayer) return;
    try {
      setSubmitting(true);
      await api.deletePlayer(activePlayer.id);
      showToast(`Player #${activePlayer.id} (${activePlayer.name}) removed from registry.`, 'success');
      setIsDeleteOpen(false);
      await fetchPlayers();
    } catch (err) {
      showToast(`Deletion failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="view-registry" className="view-panel is-active" aria-labelledby="registry-title">
      <header className="page-header">
        <div className="page-header__meta">
          <span className="badge badge--lime">Player Registry</span>
          <span className="badge badge--cyan">Authoritative Database</span>
        </div>
        <h1 id="registry-title" className="page-title">
          Contender Registry &amp; Roster Management
        </h1>
        <p className="page-description">
          Search, register, update, and manage all active contenders stored in the persistent database.
          Enforces unique IDs, score immutability during manual edits, and referential deletion safety.
        </p>
      </header>

      {/* Quarantined Records Notice */}
      <div className="stage-notice" style={{ marginBottom: '1.5rem' }}>
        <span className="stage-notice__icon">🛡️</span>
        <div>
          <h3 className="stage-notice__title">Data Integrity Sentinel</h3>
          <p className="stage-notice__body">
            Line 50 in canonical <code>players.txt</code> (<code>Shreya</code> missing score/level/team attributes) was safely quarantined during database ingestion.
            The current active roster contains exactly 53 valid records.
          </p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px', maxWidth: '500px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by Name, ID, or Team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              backgroundColor: 'var(--color-surface, #12161A)',
              border: '1px solid var(--color-border, #2A323D)',
              borderRadius: '8px',
              color: 'var(--color-text-main, #F1F5F9)',
            }}
          />
        </div>

        {/* Team Filter Pills */}
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
          <button
            id="btn-add-contender"
            type="button"
            className="btn btn--primary"
            style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
            onClick={handleOpenAdd}
          >
            + Add Contender
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div style={{ overflowX: 'auto', background: 'var(--color-surface, #12161A)', border: '1px solid var(--color-border, #2A323D)', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border, #2A323D)', background: 'var(--color-surface-raised, #181E24)' }}>
              <th style={{ padding: '0.85rem 1rem' }}>ID</th>
              <th style={{ padding: '0.85rem 1rem' }}>Contender</th>
              <th style={{ padding: '0.85rem 1rem' }}>Score</th>
              <th style={{ padding: '0.85rem 1rem' }}>Level</th>
              <th style={{ padding: '0.85rem 1rem' }}>Team</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Loading contenders from database...
                </td>
              </tr>
            ) : filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No contenders found matching criteria.
                </td>
              </tr>
            ) : (
              filteredPlayers.map((player) => (
                <tr key={player.id} style={{ borderBottom: '1px solid rgba(42, 50, 61, 0.4)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent, #00F5D4)' }}>
                    #{player.id}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                    {player.name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--color-primary, #B8F34B)' }}>
                    {player.score} PTS
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className="badge badge--neutral">Lvl {player.level}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className={`badge ${player.team === 'Warriors' ? 'badge--cyan' : player.team === 'Knights' ? 'badge--magenta' : player.team === 'Dragons' ? 'badge--lime' : 'badge--neutral'}`}>
                      {player.team || 'NoTeam'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn--outline"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        onClick={() => handleOpenEdit(player)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderColor: '#ff4757', color: '#ff4757' }}
                        onClick={() => handleOpenDelete(player)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD PLAYER MODAL */}
      {isAddOpen && (
        <div
          className="modal-overlay is-open"
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
            opacity: 1,
            visibility: 'visible',
          }}
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="modal-card"
            style={{
              backgroundColor: 'var(--color-surface, #12161A)',
              border: '1px solid var(--color-border, #2A323D)',
              borderRadius: '12px',
              maxWidth: '480px',
              width: '100%',
              padding: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>
              Register New Contender
            </h3>
            <form onSubmit={handleAddSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-text-muted)' }}>
                  Contender ID (Integer)
                </label>
                <input
                  type="number"
                  required
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="e.g. 999"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', background: '#0C0F12', border: '1px solid #2A323D', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-text-muted)' }}>
                  Contender Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Valkyrie"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', background: '#0C0F12', border: '1px solid #2A323D', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-text-muted)' }}>
                    Initial Score
                  </label>
                  <input
                    type="text"
                    value="0 PTS (Default)"
                    disabled
                    readOnly
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      background: '#181E24',
                      border: '1px solid #2A323D',
                      color: 'var(--color-primary, #B8F34B)',
                      cursor: 'not-allowed',
                      fontWeight: 600,
                    }}
                    title="All new contenders start with 0 rating points per academic rules"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-text-muted)' }}>
                    Level (1–100)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', background: '#0C0F12', border: '1px solid #2A323D', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-text-muted)' }}>
                  Team Affiliation
                </label>
                <select
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', background: '#0C0F12', border: '1px solid #2A323D', color: '#fff' }}
                >
                  <option value="Warriors">Warriors</option>
                  <option value="Knights">Knights</option>
                  <option value="Dragons">Dragons</option>
                  <option value="NoTeam">NoTeam (Solo)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn--outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Register Contender'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLAYER MODAL */}
      {isEditOpen && (
        <div
          className="modal-overlay is-open"
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
            opacity: 1,
            visibility: 'visible',
          }}
          onClick={() => setIsEditOpen(false)}
        >
          <div
            className="modal-card"
            style={{
              backgroundColor: 'var(--color-surface, #12161A)',
              border: '1px solid var(--color-border, #2A323D)',
              borderRadius: '12px',
              maxWidth: '480px',
              width: '100%',
              padding: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>
              Edit Contender #{formData.id}
            </h3>
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-text-muted)' }}>
                  Contender Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', background: '#0C0F12', border: '1px solid #2A323D', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-text-muted)' }}>
                  Level
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', background: '#0C0F12', border: '1px solid #2A323D', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-text-muted)' }}>
                  Team Affiliation
                </label>
                <select
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', background: '#0C0F12', border: '1px solid #2A323D', color: '#fff' }}
                >
                  <option value="Warriors">Warriors</option>
                  <option value="Knights">Knights</option>
                  <option value="Dragons">Dragons</option>
                  <option value="NoTeam">NoTeam (Solo)</option>
                </select>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Note: Contender score ({formData.score} PTS) is protected by the combat authority and cannot be manually modified.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn--outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title={`Remove Contender #${activePlayer?.id}?`}
        message={`Are you sure you want to delete ${activePlayer?.name}? If this player participated in active reversible matches, the system will prevent deletion to preserve undo history integrity.`}
        confirmText={submitting ? "Deleting..." : "Delete Contender"}
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </section>
  );
}
