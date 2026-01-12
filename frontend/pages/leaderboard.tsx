import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';

// Data type for leaderboard entry
type LeaderboardEntry = {
  rank: number;
  userId: string;
  email: string;
  points: number;
};

const PER_PAGE = 20;

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly'>('daily');
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async (p: string) => {
    setLoading(true);
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
      const res = await fetch(`${base}/api/leaderboard?period=${p}`);
      if (!res.ok) throw new Error(`failed ${res.status}`);
      const body = await res.json();
      setData(body);
    } catch (e) {
      console.error(e);
      setError('Unable to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(period);
  }, [period]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <Head>
        <title>Haiku Battle Leaderboard</title>
      </Head>
      <h1>Leaderboard</h1>
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setPeriod('daily')}
          style={{
            marginRight: '0.5rem',
            padding: '0.5rem 1rem',
            background: period === 'daily' ? '#0066cc' : '#eee',
            color: period === 'daily' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Daily
        </button>
        <button
          onClick={() => setPeriod('weekly')}
          style={{
            padding: '0.5rem 1rem',
            background: period === 'weekly' ? '#0066cc' : '#eee',
            color: period === 'weekly' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Weekly
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>#</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>User</th>
              <th style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, PER_PAGE).map((row) => (
              <tr key={row.userId}>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{row.rank}</td>
                <td style={{ padding: '0.5rem' }}>
                  <a href={'mailto:' + row.email} style={{ textDecoration: 'none', color: '#0066cc' }}>
                    {row.email}
                  </a>
                </td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ marginTop: '1rem' }}>
        <Link href="/">← Back to Home</Link>
      </div>
    </div>
  );
}
