import React, { useEffect, useState } from 'react';
import BattleCard from '../components/BattleCard';
import LeaderboardTable from '../components/LeaderboardTable';
import DailyWinners from '../components/DailyWinners';

/**
 * Dummy API endpoints – replace with real ones.
 * These examples return static data. In production, replace fetch URLs
 * with your backend routes such as `/api/battles`, `/api/leaderboard`,
 * and `/api/daily-winners`.
 */
async function fetchBattles() {
  return [
    {
      id: '1',
      haiku1: 'Rocks crush, moonlight falls.',
      haiku2: 'Storms rattle, stars whisper.',
      submitter1: 'Alice',
      submitter2: 'Bob',
    },
  ];
}

async function fetchLeaderboard() {
  return [
    { rank: 1, username: 'Alice', points: 120 },
    { rank: 2, username: 'Bob', points: 95 },
  ];
}

async function fetchDailyWinners() {
  return [
    { username: 'Charlie', points: 50 },
    { username: 'Dana', points: 45 },
  ];
}

const HomePage = () => {
  const [battles, setBattles] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [dailyWinners, setDailyWinners] = useState<any[]>([]);

  useEffect(() => {
    // Load data on mount
    fetchBattles().then(setBattles);
    fetchLeaderboard().then(setLeaderboard);
    fetchDailyWinners().then(setDailyWinners);
  }, []);

  const handleVote = (battleId: string, winner: 1 | 2) => {
    // Placeholder for vote handling – send POST to backend
    console.log('Vote for', battleId, 'winner', winner);
  };

  return (
    <div className="container">
      <h1>Haiku Battle League</h1>
      <section>
        <h2>Current Battles</h2>
        <div className="grid grid-sm" aria-live="polite">
          {battles.map((b) => (
            <BattleCard key={b.id} {...b} onVote={handleVote} />
          ))}
        </div>
      </section>
      <section style={{ marginTop: '32px' }}>
        <LeaderboardTable entries={leaderboard} title="Leaderboard" />
      </section>
      <section style={{ marginTop: '32px' }}>
        <DailyWinners winners={dailyWinners} />
      </section>
    </div>
  );
};

export default HomePage;
