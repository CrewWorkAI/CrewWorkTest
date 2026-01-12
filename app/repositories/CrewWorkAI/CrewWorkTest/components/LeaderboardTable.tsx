import React from 'react';

/**
 * Simple leaderboard table.
 */
interface Entry {
  rank: number;
  username: string;
  points: number;
}

interface LeaderboardTableProps {
  entries: Entry[];
  title?: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  title = 'Top Players',
}) => (
  <div className="card" aria-labelledby="leaderboard-title">
    <h3 id="leaderboard-title" aria-live="polite">{title}</h3>
    <table className="table" aria-label="Leaderboard">
      <thead>
        <tr>
          <th>#</th>
          <th>User</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e) => (
          <tr key={e.rank}>
            <td>{e.rank}</td>
            <td>{e.username}</td>
            <td>{e.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default LeaderboardTable;
