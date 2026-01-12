import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { scoreAggregationQueue } from './queue';
import { scheduleDailyWinnerJob } from './cron';
// Import worker modules to start BullMQ workers upon server boot.
import './workers/dailyWinnerWorker';
import './workers/scoreAggregationWorker';
import bcrypt from 'bcryptjs';
import redis from './redisInstance';

/** Simple token helper. Assumes token is the user ID. */
function getUserFromToken(req: express.Request): any {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  return users.find((u) => u.id === token) || null;
}

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
  passwordHash: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

const haikus: Haiku[] = [];
const battles: Battle[] = [];
const users: User[] = [];

// --- Auth (very simple demo) ----------------------------
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  const existing = users.find(u => u.email === email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user: User = {
    id: uuidv4(),
    email,
    passwordHash,
    points: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  users.push(user);
  // Return auth token (user id for demo)
  res.json({ userId: user.id, token: user.id });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  // Simple token: user id. In production use JWT
  res.json({ token: user.id, userId: user.id });
});

// --- Haiku CRUD ----------------------------
app.post('/api/haiku', (req, res) => {
  // Require authentication
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing text' });
  const haiku: Haiku = {
    id: uuidv4(),
    userId: user.id,
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
  // Allow returning fewer haikus if the pool is small, but require at least one
  if (available.length < 1) return res.status(500).json({ error: 'Not enough haikus' });
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

app.post('/api/battle', async (req, res) => {
  const { winnerId, haikuIds } = req.body;
  if (!winnerId || !Array.isArray(haikuIds) || haikuIds.length !== 2) {
    return res.status(400).json({ error: 'Provide winnerId and two haikuIds' });
  }
  // Use the authenticated user as the voting winner.
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Verify haikus exist
  const [haikuA, haikuB] = haikuIds.map(id => haikus.find(h => h.id === id));
  if (!haikuA || !haikuB) {
    return res.status(404).json({ error: 'One or both haikus not found' });
  }
  // Verify winnerId matches one of the haiku IDs (client may send the haiku id)
  if (!haikuIds.includes(winnerId)) {
    return res.status(400).json({ error: 'Winner must be one of selected haikus' });
  }
  const battle: Battle = {
    id: uuidv4(),
    winnerId: user.id, // Store user ID as the winner
    haikuAId: haikuIds[0],
    haikuBId: haikuIds[1],
    createdAt: new Date().toISOString(),
  };
  battles.push(battle);
  // Award a point to the authenticated user.
  user.points += 1;
  // Enqueue aggregation job – the worker will persist points to DB.
  await scoreAggregationQueue.add('aggregate', {
    winnerUserId: user.id,
    createdAt: battle.createdAt,
  });
  console.log(`Battle recorded: ${JSON.stringify(battle)}`);
  // Invalidate leaderboard caches
  try {
    await redis.del(`leaderboard:daily`, `leaderboard:weekly`, `leaderboard:monthly`, `leaderboard:all`);
  } catch (_) {}
  res.json(battle);
});

// --- Leaderboard ----------------------------
app.get('/api/leaderboard', async (req, res) => {
  const period = req.query.period as string | undefined;
  const cacheKey = `leaderboard:${period ?? 'all'}`;
  const ttlSeconds = 60;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
  } catch (_) {}
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
  const pointsMap: Record<string, number> = {};
  users.forEach(u => (pointsMap[u.id] = 0));
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
  try {
    await redis.set(cacheKey, JSON.stringify(leaderboard), 'EX', ttlSeconds);
  } catch (_) {}
  res.json(leaderboard);
});

// --- Authenticated user profile ----------------------------
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  const token = authHeader.slice(7).trim();
  const user = users.find(u => u.id === token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });
  res.json({ id: user.id, email: user.email, points: user.points, createdAt: user.createdAt });
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
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Haiku Battle League API listening on port ${PORT}`);
    scheduleDailyWinnerJob();
  });
}

// Export app for testing purposes
export { app };
