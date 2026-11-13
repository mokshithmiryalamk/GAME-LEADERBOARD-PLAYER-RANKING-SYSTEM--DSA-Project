import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../api/client';

describe('RANKFORGE API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches health successfully', async () => {
    const mockHealth = { status: 'UP', playerCount: 53, queueSize: 0, totalMatches: 0 };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => mockHealth,
    });

    const data = await api.getHealth();
    expect(data.status).toBe('UP');
    expect(data.playerCount).toBe(53);
    expect(global.fetch).toHaveBeenCalledWith('/api/health');
  });

  it('parses RFC 7807 ProblemDetail on 400/409 error', async () => {
    const mockProblem = {
      type: 'about:blank',
      title: 'Duplicate Player ID',
      status: 400,
      detail: 'Player with ID #101 already exists in registry.',
      instance: '/api/players',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: { get: () => 'application/json' },
      json: async () => mockProblem,
    });

    await expect(api.createPlayer({ id: 101, name: 'Amit' })).rejects.toThrow(
      'Player with ID #101 already exists in registry.'
    );
  });

  it('fetches leaderboard with query parameters', async () => {
    const mockStandings = [{ id: 104, name: 'Arjun', score: 100, team: 'Warriors' }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => mockStandings,
    });

    const data = await api.getLeaderboard({ team: 'Warriors', limit: 5 });
    expect(data).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/leaderboard?team=Warriors&limit=5');
  });

  it('executes atomic undo successfully', async () => {
    const mockUndo = {
      matchId: 1,
      undoneAt: '2026-11-14T02:00:00Z',
      winnerName: 'Arjun',
      scoreDeducted: 10,
      newScore: 100,
      status: 'UNDONE',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => mockUndo,
    });

    const res = await api.undoLastMatch();
    expect(res.matchId).toBe(1);
    expect(res.winnerName).toBe('Arjun');
    expect(res.scoreDeducted).toBe(10);
    expect(global.fetch).toHaveBeenCalledWith('/api/matches/undo', { method: 'POST' });
  });
});
