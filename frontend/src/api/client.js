/**
 * RANKFORGE Centralized REST API Client
 * Connects React frontend directly to the Spring Boot Java Backend.
 * Standardizes error parsing for RFC 7807 ProblemDetail payloads.
 */

const getApiBase = () => {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL;
  if (!envUrl || envUrl.trim() === '') return '/api';
  const cleanUrl = envUrl.trim().replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const API_BASE = getApiBase();

/**
 * Handles JSON responses and parses RFC 7807 error details.
 */
async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
    let errorDetail = null;

    if (isJson && data) {
      errorMessage = data.detail || data.message || data.title || errorMessage;
      errorDetail = data;
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.detail = errorDetail;
    throw error;
  }

  return data;
}

export const api = {
  // --- HEALTH & TELEMETRY ---
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  // --- PLAYERS (Player Registry) ---
  async getPlayers() {
    const res = await fetch(`${API_BASE}/players`);
    return handleResponse(res);
  },

  async getPlayerById(id) {
    const res = await fetch(`${API_BASE}/players/${id}`);
    return handleResponse(res);
  },

  async searchPlayers({ query, name, team } = {}) {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (name) params.append('name', name);
    if (team) params.append('team', team);

    const qs = params.toString();
    const url = qs ? `${API_BASE}/players/search?${qs}` : `${API_BASE}/players`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async createPlayer(player) {
    const res = await fetch(`${API_BASE}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player),
    });
    return handleResponse(res);
  },

  async updatePlayer(id, updates) {
    const res = await fetch(`${API_BASE}/players/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  async deletePlayer(id) {
    const res = await fetch(`${API_BASE}/players/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async resetDemoData() {
    const res = await fetch(`${API_BASE}/players/reset`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // --- LEADERBOARD (QuickSort Lomuto Java Backend) ---
  async getLeaderboard({ team, limit = 0 } = {}) {
    const params = new URLSearchParams();
    if (team && team !== 'All' && team !== 'ALL') params.append('team', team);
    if (limit > 0) params.append('limit', limit);

    const qs = params.toString();
    const url = qs ? `${API_BASE}/leaderboard?${qs}` : `${API_BASE}/leaderboard`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  // --- QUEUE (Circular Matchmaking Lobby) ---
  async getQueue() {
    const res = await fetch(`${API_BASE}/queue`);
    return handleResponse(res);
  },

  async joinQueue(playerId) {
    const res = await fetch(`${API_BASE}/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });
    return handleResponse(res);
  },

  async leaveQueue(playerId) {
    const res = await fetch(`${API_BASE}/queue/${playerId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async clearQueue() {
    const res = await fetch(`${API_BASE}/queue/clear`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // --- MATCHES & COMBAT ENGINE ---
  async playMatch(type = '1v1') {
    const res = await fetch(`${API_BASE}/matches/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchType: type }),
    });
    return handleResponse(res);
  },

  async playSoloMatch() {
    const res = await fetch(`${API_BASE}/matches/solo`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async playTeamMatch() {
    const res = await fetch(`${API_BASE}/matches/team`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async getMatchHistory({ status, limit = 0 } = {}) {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (limit > 0) params.append('limit', limit);

    const qs = params.toString();
    const url = qs ? `${API_BASE}/matches?${qs}` : `${API_BASE}/matches`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async getMatchById(id) {
    const res = await fetch(`${API_BASE}/matches/${id}`);
    return handleResponse(res);
  },

  async undoLastMatch() {
    const res = await fetch(`${API_BASE}/matches/undo`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};

export default api;
