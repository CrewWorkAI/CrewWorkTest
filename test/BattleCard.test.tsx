import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BattleCard from '../../app/repositories/CrewWorkAI/CrewWorkTest/components/BattleCard';

describe('BattleCard component', () => {
  const mockOnVote = jest.fn();
  const props = {
    id: 'battle123',
    haiku1: 'First haiku content',
    haiku2: 'Second haiku content',
    submitter1: 'Alice',
    submitter2: 'Bob',
    onVote: mockOnVote,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    render(<BattleCard {...props} />);
  });

  test('renders battle id heading', () => {
    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Battle #battle123');
  });

  test('renders both haikus and submitters correctly', () => {
    expect(screen.getByText('First haiku content')).toBeInTheDocument();
    expect(screen.getByText('— Alice')).toBeInTheDocument();
    expect(screen.getByText('Second haiku content')).toBeInTheDocument();
    expect(screen.getByText('— Bob')).toBeInTheDocument();
  });

  test('clicking Vote on first haiku triggers onVote with winner=1', () => {
    const buttons = screen.getAllByRole('button');
    // buttons[0] corresponds to first haiku
    fireEvent.click(buttons[0]);
    expect(mockOnVote).toHaveBeenCalledWith('battle123', 1);
  });

  test('clicking Vote on second haiku triggers onVote with winner=2', () => {
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(mockOnVote).toHaveBeenCalledWith('battle123', 2);
  });
});

