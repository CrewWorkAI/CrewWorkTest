import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [haikus, setHaikus] = useState<Array<{ id: string; text: string }>>([]);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState<null | { id: string; email: string; points: number }>();
  const [newHaiku, setNewHaiku] = useState('');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setToken(stored);
  }, []);

  // Fetch a random pair of haikus when the page loads or token changes
  useEffect(() => {
    async function fetchHaikus() {
      try {
        const response = await axios.get<{ haikus: Array<{ id: string; text: string }> }>(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/battle/pair`,
        );
        setHaikus(response.data.haikus ?? []);
      } catch (e) {
        console.error('Failed to fetch haikus', e);
      }
    }
    fetchHaikus();
  }, [token]);

  const handleLogin = async () => {
    try {
      const resp = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/auth/login`,
        { email, password },
      );
      const t = resp.data.token;
      setToken(t);
      if (typeof window !== 'undefined') localStorage.setItem('token', t);
    } catch (e) {
      console.error('Login failed', e);
    }
  };

  const handleProfile = async () => {
    if (!token) return;
    try {
      const r = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setProfile(r.data);
    } catch (e) {
      console.error('Profile fetch error', e);
    }
  };

  const handleSubmitHaiku = async () => {
    if (!token || !newHaiku) return;
    try {
      const r = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/haiku`,
        { text: newHaiku },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log('Haiku submitted', r.data);
      setNewHaiku('');
    } catch (e) {
      console.error('Submit error', e);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Haiku Battle League</h1>
      <p>Welcome to head‑to‑head haiku battles!</p>
      <section style={{ marginBottom: '2rem' }}>
        <h2>User Auth</h2>
        {!token ? (
          <div>
            <input
              type='email'
              placeholder='Email'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type='password'
              placeholder='Password'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
          </div>
        ) : (
          <div>
            <p>Logged in. <button onClick={handleProfile}>Get Profile</button></p>
            {profile && (
              <div>
                <p>ID: {profile.id}</p>
                <p>Email: {profile.email}</p>
                <p>Points: {profile.points}</p>
              </div>
            )}
          </div>
        )}
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h2>Submit a Haiku</h2>
        {token ? (
          <div>
            <textarea
              value={newHaiku}
              onChange={e => setNewHaiku(e.target.value)}
              rows={3}
              cols={40}
              placeholder='Your haiku...'
            />
            <br />
            <button onClick={handleSubmitHaiku}>Submit</button>
          </div>
        ) : (
          <p>Login to submit a haiku.</p>
        )}
      </section>
      <section>
        <h2>Sample Haiku Pair</h2>
        {haikus.length > 0 ? (
          <ol>
            {haikus.map(h => (
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
