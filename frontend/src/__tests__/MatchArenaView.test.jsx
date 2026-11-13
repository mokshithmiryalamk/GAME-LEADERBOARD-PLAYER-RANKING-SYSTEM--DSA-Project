import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MatchArenaView from '../views/MatchArenaView';
import { ToastProvider } from '../context/ToastContext';
import { api } from '../api/client';

describe('MatchArenaView Component', () => {
  const mockQueue = [
    { id: 1, playerId: 104, playerName: 'Arjun', playerScore: 100, playerTeam: 'Warriors', slotIndex: 0 },
    { id: 2, playerId: 102, playerName: 'Rahul', playerScore: 90, playerTeam: 'Warriors', slotIndex: 1 },
  ];

  const mockPlayers = [
    { id: 101, name: 'Amit', score: 80, level: 2, team: 'NoTeam' },
    { id: 102, name: 'Rahul', score: 90, level: 4, team: 'Warriors' },
    { id: 104, name: 'Arjun', score: 100, level: 5, team: 'Warriors' },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, 'getQueue').mockResolvedValue(mockQueue);
    vi.spyOn(api, 'getPlayers').mockResolvedValue(mockPlayers);
  });

  it('renders circular buffer slots and allows playing 1v1 match', async () => {
    vi.spyOn(api, 'playSoloMatch').mockResolvedValue({
      matchId: 10,
      matchType: '1v1',
      player1Name: 'Arjun',
      player2Name: 'Rahul',
      player1Roll: 5,
      player2Roll: 2,
      winnerName: 'Arjun',
      status: 'COMPLETED',
    });

    render(
      <ToastProvider>
        <MatchArenaView />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Circular Queue Ring Buffer (Capacity: 50)')).toBeInTheDocument();
      expect(screen.getByText('👑 Head (Next Up)')).toBeInTheDocument();
    });

    // Play 1v1 button should be enabled
    const soloBtn = screen.getByRole('button', { name: /Play 1v1 Solo/i });
    expect(soloBtn).not.toBeDisabled();

    fireEvent.click(soloBtn);

    await waitFor(() => {
      expect(screen.getByText(/Victory: Arjun/i)).toBeInTheDocument();
    });
  });
});
