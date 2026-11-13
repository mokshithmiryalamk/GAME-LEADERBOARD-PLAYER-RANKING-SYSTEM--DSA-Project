import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MatchHistoryView from '../views/MatchHistoryView';
import { ToastProvider } from '../context/ToastContext';
import { api } from '../api/client';

describe('MatchHistoryView Component', () => {
  const mockMatches = [
    {
      matchId: 1,
      matchType: '1v1',
      player1Name: 'Arjun',
      player2Name: 'Rahul',
      player1Roll: 6,
      player2Roll: 3,
      winnerName: 'Arjun',
      status: 'COMPLETED',
      timestamp: '2026-11-14T02:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, 'getMatchHistory').mockResolvedValue(mockMatches);
    vi.spyOn(api, 'getHealth').mockResolvedValue({ activeStackDepth: 1 });
  });

  it('renders LIFO stack depth and match entries', async () => {
    render(
      <ToastProvider>
        <MatchHistoryView />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('1 Reversible')).toBeInTheDocument();
      expect(screen.getByText('Arjun vs Rahul')).toBeInTheDocument();
      expect(screen.getByText('🎲 6 - 3')).toBeInTheDocument();
    });

    const undoBtn = screen.getByRole('button', { name: /Atomic Undo Last Match/i });
    expect(undoBtn).not.toBeDisabled();

    // Clicking undo opens confirmation modal
    fireEvent.click(undoBtn);
    expect(screen.getByText('Undo Latest Combat Match?')).toBeInTheDocument();
  });
});
