import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DailyWinners from '../frontend/components/DailyWinners';

describe('DailyWinners component', () => {
  const winners = [
    { username: 'alice', points: 15 },
    { username: 'bob', points: 12 },
    { username: 'charlie', points: 9 },
  ];

  test('renders title and list items correctly', () => {
    render(<DailyWinners winners={winners} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Daily Winners');
    winners.forEach((w, idx) => {
      const listItem = screen.getByText(new RegExp(`${idx + 1}\.`, 'i'));
      expect(listItem).toBeInTheDocument();
      expect(screen.getByText(`${w.username} — ${w.points} pts`)).toBeInTheDocument();
    });
  });

  test('renders correctly with empty winners list', () => {
    render(<DailyWinners winners={[]} />);
    // No list items should appear
    expect(screen.queryByRole('list')).toBeInTheDocument();
    expect(screen.queryByText(/pts/i)).not.toBeInTheDocument();
  });
});

