import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import { api } from '../api/client';

describe('RANKFORGE React Application Shell', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Default mocks
    vi.spyOn(api, 'getHealth').mockResolvedValue({
      status: 'UP',
      playerCount: 53,
      quarantinedCount: 1,
      queueSize: 0,
      totalMatches: 0,
      activeStackDepth: 0,
    });
    vi.spyOn(api, 'getLeaderboard').mockResolvedValue([
      { id: 104, name: 'Arjun', score: 100, level: 5, team: 'Warriors' },
      { id: 102, name: 'Rahul', score: 90, level: 4, team: 'Warriors' },
      { id: 103, name: 'Neha', score: 90, level: 3, team: 'Knights' },
    ]);
    vi.spyOn(api, 'getPlayers').mockResolvedValue([
      { id: 101, name: 'Amit', score: 80, level: 2, team: 'NoTeam' },
      { id: 102, name: 'Rahul', score: 90, level: 4, team: 'Warriors' },
      { id: 104, name: 'Arjun', score: 100, level: 5, team: 'Warriors' },
    ]);
    vi.spyOn(api, 'getQueue').mockResolvedValue([]);
    vi.spyOn(api, 'getMatchHistory').mockResolvedValue([]);
  });

  it('renders application brand, header, and overview dashboard', async () => {
    render(<App />);

    expect(screen.getAllByText('RANKFORGE').length).toBeGreaterThan(0);
    expect(screen.getByText('Player Rankings & Match Arena')).toBeInTheDocument();
    expect(screen.getByText('Executive Mission Dashboard')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('53')).toBeInTheDocument();
    });
  });

  it('navigates seamlessly across all 6 views', async () => {
    render(<App />);

    // Wait for initial overview load
    await waitFor(() => {
      expect(screen.getByText('53')).toBeInTheDocument();
    });

    // 1. Navigate to Player Registry
    fireEvent.click(screen.getByText('Player Registry'));
    await waitFor(() => {
      expect(screen.getByText('Contender Registry & Roster Management')).toBeInTheDocument();
    });

    // 2. Navigate to Ranked Standings
    fireEvent.click(screen.getByText('Ranked Standings'));
    await waitFor(() => {
      expect(screen.getByText('Esports Ranked Leaderboard')).toBeInTheDocument();
    });

    // 3. Navigate to Combat Arena
    fireEvent.click(screen.getByText('Combat Arena'));
    await waitFor(() => {
      expect(screen.getByText('Esports Match Arena & Combat Lobby')).toBeInTheDocument();
    });

    // 4. Navigate to Match History
    fireEvent.click(screen.getByText('Match History'));
    await waitFor(() => {
      expect(screen.getByText('Combat History & Transaction-Safe Undo')).toBeInTheDocument();
    });

    // 5. Navigate to DSA Lab
    fireEvent.click(screen.getByText('DSA Lab'));
    await waitFor(() => {
      expect(screen.getByText('Interactive DSA Algorithm Simulator')).toBeInTheDocument();
    });

    // 6. Navigate back to Arena Overview
    fireEvent.click(screen.getByText('Arena Overview'));
    await waitFor(() => {
      expect(screen.getByText('Executive Mission Dashboard')).toBeInTheDocument();
      expect(screen.getByText('53')).toBeInTheDocument();
    });
  });
});
