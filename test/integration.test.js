// Integration test suite for the Haiku Battle League API.
// This script spawns the server, exercises key endpoints, and
// validates responses. It is intentionally lightweight and
// does not rely on extra test frameworks.

const { spawn } = require('child_process');
const assert = require('assert');
const path = require('path');

/**
 * Launch the server and wait until the listening message appears.
 * Returns the spawned child process.
 */
function launchServer() {
  const server = spawn(process.execPath, [path.join(__dirname, '..', 'dist', 'server.js')], {
    env: { ...process.env, PORT: '3004' },
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Server start timed out'));
    }, 5000);

    server.stderr.on('data', data => console.error(data.toString()));
    server.stdout.on('data', data => {
      const msg = data.toString();
      if (msg.includes('Haiku Battle League API listening')) {
        clearTimeout(timeout);
        resolve(server);
      }
    });
  });
}

/**
 * Helper to perform HTTP requests using the global fetch.
 */
function request(method, url, body = null, token = null) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  if (token) options.headers.Authorization = `Bearer ${token}`;
  return fetch(url, options).then(res => res.json().then(body => ({ status: res.status, body })))
    .then(({ status, body }) => ({ status, body }));
}

async function runTests() {
  const server = await launchServer();
  const base = 'http://localhost:3004';
  let userId, token, haikuId;

  // 1. Register a user
  const reg = await request('POST', `${base}/api/auth/register`, { email: 'test@example.com', password: 'secret' });
  assert.strictEqual(reg.status, 200, 'Register response must be OK');
  userId = reg.body.userId;
  assert.ok(userId, 'User ID returned');

  // 2. Login the user
  const lg = await request('POST', `${base}/api/auth/login`, { email: 'test@example.com', password: 'secret' });
  assert.strictEqual(lg.status, 200, 'Login response must be OK');
  token = lg.body.token;
  assert.strictEqual(lg.body.userId, userId, 'Login returns same user ID');

  // 2.5. Register & login second user (needs to provide two haikus from other user)
  const reg2 = await request('POST', `${base}/api/auth/register`, { email: 'test2@example.com', password: 'secret' });
  assert.strictEqual(reg2.status, 200, 'Second user registration OK');
  const user2Id = reg2.body.userId;
  const lg2 = await request('POST', `${base}/api/auth/login`, { email: 'test2@example.com', password: 'secret' });
  assert.strictEqual(lg2.status, 200, 'Second user login OK');
  const token2 = lg2.body.token;
  assert.strictEqual(lg2.body.userId, user2Id, 'Second login returns correct user ID');

  // Create two haikus for the second user
  const haiku2Res = await request('POST', `${base}/api/haiku`, { userId: user2Id, text: 'Winter wind whispers' }, token2);
  assert.strictEqual(haiku2Res.status, 200, 'Second user haiku creation OK');
  const haiku2Id = haiku2Res.body.id;
  assert.ok(haiku2Id, 'Second haiku ID returned');

  const haiku3Res = await request('POST', `${base}/api/haiku`, { userId: user2Id, text: "Autumn's breath lingers" }, token2);
  assert.strictEqual(haiku3Res.status, 200, 'Third haiku creation OK');
  const haiku3Id = haiku3Res.body.id;
  assert.ok(haiku3Id, 'Third haiku ID returned');

  // 3. Create a haiku
  const haikuRes = await request('POST', `${base}/api/haiku`, { userId, text: 'Silent snow falls' }, token);
  assert.strictEqual(haikuRes.status, 200, 'Haiku creation OK');
  haikuId = haikuRes.body.id;
  assert.ok(haikuId, 'Haiku ID returned');

  // 4. Retrieve haiku by ID
  const getHaiku = await request('GET', `${base}/api/haiku/${haikuId}`);
  assert.strictEqual(getHaiku.status, 200, 'Get haiku OK');
  assert.strictEqual(getHaiku.body.id, haikuId, 'Haiku ID matches');

  // 5. Fetch random haikus (should include our haiku)
  const rand = await request('GET', `${base}/api/haiku/random?qty=2`);
  assert.strictEqual(rand.status, 200, 'Random haiku OK');
  assert.ok(Array.isArray(rand.body), 'Random response is array');
  assert.ok(rand.body.length >= 1, 'At least one haiku returned');

  // 6. Battle pairing
  const pairRes = await request('GET', `${base}/api/battle/pair?excludeUser=${userId}`);
  assert.strictEqual(pairRes.status, 200, 'Battle pair OK');
  assert.ok(Array.isArray(pairRes.body), 'Pair response is array');
  assert.strictEqual(pairRes.body.length, 2, 'Exactly two haikus returned');
  const [haikuA, haikuB] = pairRes.body;
  const battleBody = { winnerId: haikuA.id, haikuIds: [haikuA.id, haikuB.id] };

  // 7. Submit battle
  const battleRes = await request('POST', `${base}/api/battle`, battleBody, token);
  assert.strictEqual(battleRes.status, 200, 'Battle submission OK');

  // 8. Leaderboard
  const lbRes = await request('GET', `${base}/api/leaderboard`);
  assert.strictEqual(lbRes.status, 200, 'Leaderboard OK');
  const userEntry = lbRes.body.find(e => e.userId === userId);
  assert.ok(userEntry, 'User is in leaderboard');
  assert.ok(userEntry.points >= 1, 'User has at least one point');

  // 9. Authenticated profile
  const me = await request('GET', `${base}/api/auth/me`, null, token);
  assert.strictEqual(me.status, 200, 'Profile OK');
  assert.strictEqual(me.body.id, userId, 'Profile userId matches');

  // 10. Points endpoint
  const pts = await request('GET', `${base}/api/points?userId=${userId}`);
  assert.strictEqual(pts.status, 200, 'Points OK');
  assert.ok(pts.body.totalPoints >= 1, 'Total points >= 1');

  // Clean up: terminate server
  server.kill();
  console.log('All integration tests passed');
}

runTests().catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});
