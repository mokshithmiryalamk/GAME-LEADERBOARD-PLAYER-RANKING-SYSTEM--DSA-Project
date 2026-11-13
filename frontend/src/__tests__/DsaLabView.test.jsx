import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DsaLabView from '../views/DsaLabView';

describe('DsaLabView Component', () => {
  it('renders all 7 DSA lab topics and switches seamlessly', () => {
    render(<DsaLabView />);

    expect(screen.getByText('Interactive DSA Algorithm Simulator')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /PlayerArray/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /PlayerList/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /PlayerQueue/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /MatchHistoryStack/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hash Map/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search Algorithms/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /QuickSort Lomuto/i })).toBeInTheDocument();

    // Switch to QuickSort Lomuto
    fireEvent.click(screen.getByRole('button', { name: /QuickSort Lomuto/i }));
    expect(screen.getByText(/Lomuto Partition/i)).toBeInTheDocument();

    // Step next
    const stepNextBtn = screen.getByRole('button', { name: /Step Next/i });
    fireEvent.click(stepNextBtn);
    expect(screen.getByText(/Scan Elements & Swap/i)).toBeInTheDocument();
  });
});
