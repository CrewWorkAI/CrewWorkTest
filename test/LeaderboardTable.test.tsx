import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeaderboardTable from '../frontend/components/LeaderboardTable';

describe('LeaderboardTable', () => {
  const entries = [
    { rank: 1, username: 'alice', points: 10 },
    { rank: 2, username: 'bob', points: 8 },
    { rank: 3, username: 'charlie', points: 3 },
  ];

  test('renders title when provided', () => {
    render(<LeaderboardTable entries={entries} title="Daily Standings" />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Daily Standings');
  });

  test('renders default title when omitted', () => {
    render(<LeaderboardTable entries={entries} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Top Players');
  });

  test('renders each entry row correctly', () => {
    render(<LeaderboardTable entries={entries} />);
    entries.forEach((e) => {
      expect(screen.getByText(String(e.rank))).toBeInTheDocument();
      expect(screen.getByText(e.username)).toBeInTheDocument();
      expect(screen.getByText(String(e.points))).toBeInTheDocument();
    });
  });
});

