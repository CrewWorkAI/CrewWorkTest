import React from 'react';

/**
 * Simple account list component used in UI smoke tests.
 * It expects an array of account objects with at least an `id` and `name`.
 *
 * @param {Object} props
 * @param {Array<{id:string, name:string}>} props.accounts
 */
export default function AccountList({ accounts }) {
  return (
    <ul data-testid="account-list">
      {accounts.map((acct) => (
        <li key={acct.id} data-testid="account-item">
          {acct.name}
        </li>
      ))}
    </ul>
  );
}

