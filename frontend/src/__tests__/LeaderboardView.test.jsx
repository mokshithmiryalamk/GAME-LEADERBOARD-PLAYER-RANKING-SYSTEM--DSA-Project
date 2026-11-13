import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LeaderboardView from '../views/LeaderboardView';
import { ToastProvider } from '../context/ToastContext';
import { api } from '../api/client';

describe('LeaderboardView Component', () => {
  const mockStandings = [
    { id: 104, name: 'Arjun', score: 100, level: 5, team: 'Warriors' },
    { id: 102, name: 'Rahul', score: 90, level: 4, team: 'Warriors' },
    { id: 103, name: 'Neha', score: 90, level: 3, team: 'Knights' },
    { id: 101, name: 'Amit', score: 80, level: 2, team: 'NoTeam' },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, 'getLeaderboard').mockResolvedValue(mockStandings);
  });

  it('renders Top 3 podium badges and standings table', async () => {
    render(
      <ToastProvider>
        <LeaderboardView />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('👑 #1 CHAMPION')).toBeInTheDocument();
      expect(screen.getByText('#2 SILVER')).toBeInTheDocument();
      expect(screen.getByText('#3 BRONZE')).toBeInTheDocument();
    });

    expect(screen.getAllByText('100 PTS').length).toBeGreaterThan(0);
    expect(screen.getByText('LEADER')).toBeInTheDocument();
  });
});
