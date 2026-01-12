import React from 'react';

interface Winner {
  username: string;
  points: number;
}

interface Props {
  winners: Winner[];
}

const DailyWinners: React.FC<Props> = ({ winners }) => (
  <div className="card" aria-labelledby="daily-winners-title">
    <h3 id="daily-winners-title">Daily Winners</h3>
    <ul className="grid grid-sm" aria-label="Daily Winners List">
      {winners.map((w, idx) => (
        <li key={w.username} style={{ marginBottom: '8px' }}>
          <strong>{idx + 1}.</strong> {w.username} — {w.points} pts
        </li>
      ))}
    </ul>
  </div>
);

export default DailyWinners;
