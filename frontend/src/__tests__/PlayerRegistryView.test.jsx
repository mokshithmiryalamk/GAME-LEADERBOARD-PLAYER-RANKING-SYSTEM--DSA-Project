import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlayerRegistryView from '../views/PlayerRegistryView';
import { ToastProvider } from '../context/ToastContext';
import { api } from '../api/client';

describe('PlayerRegistryView Component', () => {
  const mockPlayers = [
    { id: 101, name: 'Amit', score: 80, level: 2, team: 'NoTeam' },
    { id: 102, name: 'Rahul', score: 90, level: 4, team: 'Warriors' },
    { id: 103, name: 'Neha', score: 90, level: 3, team: 'Knights' },
    { id: 104, name: 'Arjun', score: 100, level: 5, team: 'Warriors' },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, 'getPlayers').mockResolvedValue(mockPlayers);
  });

  it('renders contender roster and filters by search query', async () => {
    render(
      <ToastProvider>
        <PlayerRegistryView />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Amit')).toBeInTheDocument();
      expect(screen.getByText('Arjun')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by Name, ID, or Team...');
    fireEvent.change(searchInput, { target: { value: 'Arjun' } });

    expect(screen.getByText('Arjun')).toBeInTheDocument();
    expect(screen.queryByText('Amit')).not.toBeInTheDocument();
  });

  it('filters contenders by team tab', async () => {
    render(
      <ToastProvider>
        <PlayerRegistryView />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Amit')).toBeInTheDocument();
    });

    // Click 'Knights' team filter
    const knightsBtn = screen.getByRole('button', { name: 'Knights' });
    fireEvent.click(knightsBtn);

    expect(screen.getByText('Neha')).toBeInTheDocument();
    expect(screen.queryByText('Rahul')).not.toBeInTheDocument();
  });

  it('opens and closes Add Contender modal', async () => {
    render(
      <ToastProvider>
        <PlayerRegistryView />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('+ Add Contender')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Add Contender'));
    expect(screen.getByText('Register New Contender')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Register New Contender')).not.toBeInTheDocument();
  });
});
