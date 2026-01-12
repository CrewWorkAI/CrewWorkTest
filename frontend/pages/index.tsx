import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [haikus, setHaikus] = useState<Array<{ id: string; text: string }>>([]);

  useEffect(() => {
    // Fetch a random pair of haikus from backend API for demo
    async function fetchHaikus() {
      try {
        const response = await axios.get<{ haikus: Array<{ id: string; text: string }> }>(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'} /api/battle/pair`,
        );
        setHaikus(response.data.haikus ?? []);
      } catch (e) {
        console.error('Failed to fetch haikus', e);
      }
    }
    fetchHaikus();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Haiku Battle League</h1>
      <p>Welcome to the head‑to‑head haiku battle platform.</p>
      <section>
        <h2>Sample Haiku Pair</h2>
        {haikus.length > 0 ? (
          <ol>
            {haikus.map((h) => (
              <li key={h.id} style={{ marginBottom: '1rem' }}>
                {h.text}
              </li>
            ))}
          </ol>
        ) : (
          <p>Loading…</p>
        )}
      </section>
    </div>
  );
}
