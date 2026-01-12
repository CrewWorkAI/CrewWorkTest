const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In‑memory storage for demo purposes
const haikus = [];
const battles = [];
const users = [];

// --- Auth (very simple demo) --------------------------------------------
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  const user = { id: uuidv4(), email, password, points: 0 };
  users.push(user);
  res.json({ userId: user.id });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ userId: user.id });
});

// --- Haiku CRUD ----------------------------------------------------------
app.post('/api/haiku', (req, res) => {
  const { userId, text } = req.body;
  if (!userId || !text) return res.status(400).json({ error: 'Missing userId or text' });
  const haiku = { id: uuidv4(), userId, text, createdAt: new Date().toISOString() };
  haikus.push(haiku);
  res.json(haiku);
});

app.get('/api/haiku/random', (req, res) => {
  const qty = parseInt(req.query.qty) || 2;
  if (haikus.length < 2) return res.status(500).json({ error: 'Not enough haikus' });
  const shuffled = [...haikus].sort(() => 0.5 - Math.random());
  res.json(shuffled.slice(0, qty));
});

// --- Battle -------------------------------------------------------------
app.post('/api/battle', (req, res) => {
  const { winnerId, haikuAId, haikuBId } = req.body;
  if (!winnerId || !haikuAId || !haikuBId)
    return res.status(400).json({ error: 'Missing data' });
  const battle = {
    id: uuidv4(),
    winnerId,
    haikuAId,
    haikuBId,
    createdAt: new Date().toISOString(),
  };
  battles.push(battle);
  // Update points (very basic, 1 point per win)
  const winner = users.find(u => u.id === winnerId);
  if (winner) winner.points += 1;
  res.json(battle);
});

// --- Leaderboard --------------------------------------------------------
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

