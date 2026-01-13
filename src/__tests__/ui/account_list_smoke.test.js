import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountList from '../../ui/AccountList';

describe('AccountList UI smoke test', () => {
  const mockAccounts = [
    { id: '1', name: 'Acme Corp' },
    { id: '2', name: 'Globex Inc' },
  ];

  test('renders a list with the correct number of items', () => {
    render(<AccountList accounts={mockAccounts} />);
    const list = screen.getByTestId('account-list');
    expect(list).toBeInTheDocument();
    const items = screen.getAllByTestId('account-item');
    expect(items).toHaveLength(mockAccounts.length);
    expect(items[0]).toHaveTextContent('Acme Corp');
    expect(items[1]).toHaveTextContent('Globex Inc');
  });
});

