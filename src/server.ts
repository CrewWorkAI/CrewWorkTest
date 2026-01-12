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
  const haiku: Haiku = { id: uuidv4(), userId, text, createdAt: new Date().toISOString() };
  haikus.push(haiku);
  res.json(haiku);
});

app.get('/api/haiku/random', (req, res) => {
  const qty = parseInt(req.query.qty as string) || 2;
  if (haikus.length < 2) return res.status(500).json({ error: 'Not enough haikus' });
  const shuffled = [...haikus].sort(() => 0.5 - Math.random());
  res.json(shuffled.slice(0, qty));
});

// --- Haiku retrieval by ID ----------------------------
app.get('/api/haiku/:id', (req, res) => {
  const { id } = req.params;
  const haiku = haikus.find(h => h.id === id);
  if (!haiku) return res.status(404).json({ error: 'Haiku not found' });
  res.json(haiku);
});

// --- Battle ----------------------------
app.post('/api/battle', (req, res) => {
  const { winnerId, haikuAId, haikuBId } = req.body;
  if (!winnerId || !haikuAId || !haikuBId) return res.status(400).json({ error: 'Missing data' });
  const battle: Battle = {
    id: uuidv4(),
    winnerId,
    haikuAId,
    haikuBId,
    createdAt: new Date().toISOString(),
  };
  battles.push(battle);
  // Update points (basic, 1 point per win)
  const winner = users.find(u => u.id === winnerId);
  if (winner) winner.points += 1;
  res.json(battle);
});

// --- Leaderboard ----------------------------
app.get('/api/leaderboard', (req, res) => {
  const sorted = [...users].sort((a, b) => b.points - a.points);
  const leaderboard = sorted.map((u, idx) => ({
    rank: idx + 1,
    userId: u.id,
    email: u.email,
    points: u.points,
  }));
  res.json(leaderboard);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Haiku Battle League API listening on port ${PORT}`));
