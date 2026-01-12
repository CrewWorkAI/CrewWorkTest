import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In‑memory storage for demo purposes
interface Haiku {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

interface Battle {
  id: string;
  winnerId: string;
  haikuAId: string;
  haikuBId: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  password: string;
  points: number;
}

const haikus: Haiku[] = [];
const battles: Battle[] = [];
const users: User[] = [];

// --- Auth (very simple demo) ----------------------------
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  const user: User = { id: uuidv4(), email, password, points: 0 };
  users.push(user);
  res.json({ userId: user.id });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ userId: user.id });
});

// --- Haiku CRUD ----------------------------
app.post('/api/haiku', (req, res) => {
  const { userId, text } = req.body;
  if (!userId || !text) return res.status(400).json({ error: 'Missing userId or text' });
  const haiku: Haiku = {
    id: uuidv4(),
    userId,
    text,
    createdAt: new Date().toISOString(),
  };
  haikus.push(haiku);
  res.json(haiku);
});

/**
 * Returns a set of random haikus.
 * Optional `qty` query parameter (default 2) and `excludeUser` to avoid
 * returning a haiku belonging to a particular user (useful for pairing).
 */
app.get('/api/haiku/random', (req, res) => {
  const qty = Math.max(1, parseInt(req.query.qty as string) || 2);
  const excludeUser = typeof req.query.excludeUser === 'string' ? req.query.excludeUser : undefined;
  const available = excludeUser
    ? haikus.filter((h) => h.userId !== excludeUser)
    : haikus;
  if (available.length < 2) return res.status(500).json({ error: 'Not enough haikus' });
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  res.json(shuffled.slice(0, Math.min(qty, shuffled.length)));
});

// --- Haiku retrieval by ID ----------------------------
app.get('/api/haiku/:id', (req, res) => {
  const { id } = req.params;
  const haiku = haikus.find(h => h.id === id);
  if (!haiku) return res.status(404).json({ error: 'Haiku not found' });
  res.json(haiku);
});

// --- Battle ----------------------------
/**
 * Provides a random pairing of two haikus for a user to vote on.
 * Optional `excludeUser` query param ensures the user does not see their own
 * haiku in the pair.
 */
app.get('/api/battle/pair', (req, res) => {
  const qty = 2;
  const excludeUser = typeof req.query.excludeUser === 'string' ? req.query.excludeUser : undefined;
  const available = excludeUser
    ? haikus.filter((h) => h.userId !== excludeUser)
    : haikus;
  if (available.length < 2) {
    return res.status(500).json({ error: 'Not enough haikus for pairing' });
  }
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  const pair = shuffled.slice(0, qty);
  res.json(pair);
});

app.post('/api/battle', (req, res) => {
  const { winnerId, haikuIds } = req.body;
  if (!winnerId || !Array.isArray(haikuIds) || haikuIds.length !== 2) {
    return res.status(400).json({ error: 'Provide winnerId and two haikuIds' });
  }
  const battle: Battle = {
    id: uuidv4(),
    winnerId,
    haikuAId: haikuIds[0],
    haikuBId: haikuIds[1],
    createdAt: new Date().toISOString(),
  };
  // Verify haikus exist
  const [haikuA, haikuB] = haikuIds.map(id => haikus.find(h => h.id === id));
  if (!haikuA || !haikuB) {
    return res.status(404).json({ error: 'One or both haikus not found' });
  }
  // Verify winner is one of the haikus
  if (!haikuIds.includes(winnerId)) {
    return res.status(400).json({ error: 'Winner must be one of selected haikus' });
  }
  battles.push(battle);
  // Update points (basic, 1 point per win)
  const winner = users.find(u => u.id === winnerId);
  if (winner) winner.points += 1;
  res.json(battle);
});

// --- Leaderboard ----------------------------
app.get('/api/leaderboard', (req, res) => {
  const period = req.query.period as string | undefined;
  const now = new Date();
  let startDate: Date | null = null;
  if (period === 'daily') {
    startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); // midnight UTC
  } else if (period === 'weekly') {
    // ISO week starts Monday
    const day = now.getUTCDay();
    const diff = (day + 6) % 7; // days since Monday
    startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
  } else if (period === 'monthly') {
    startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }
  let pointsMap: Record<string, number> = {};
  users.forEach(u => pointsMap[u.id] = 0);
  battles.forEach(b => {
    if (startDate && new Date(b.createdAt) < startDate) return;
    pointsMap[b.winnerId] = (pointsMap[b.winnerId] ?? 0) + 1;
  });
  const sorted = Object.entries(pointsMap)
    .map(([id, pts]) => ({ id, pts }))
    .sort((a, b) => b.pts - a.pts);
  const leaderboard = sorted.map((u, idx) => {
    const user = users.find(u2 => u2.id === u.id);
    return {
      rank: idx + 1,
      userId: u.id,
      email: user ? user.email : 'unknown',
      points: u.pts,
    };
  });
  res.json(leaderboard);
});

// --- Points aggregation ----------------------------
app.get('/api/points', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId query param' });
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const now = new Date();
  const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const diff = (now.getUTCDay() + 6) % 7;
  weekStart.setUTCDate(weekStart.getUTCDate() - diff);
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  let total = 0, week = 0, month = 0;
  battles.forEach(b => {
    if (b.winnerId !== userId) return;
    total += 1;
    const bd = new Date(b.createdAt);
    if (bd >= weekStart) week += 1;
    if (bd >= monthStart) month += 1;
  });
  res.json({ totalPoints: total, weekPoints: week, monthPoints: month });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Haiku Battle League API listening on port ${PORT}`));
