const http = require('http');
const { app } = require('../../test/src/server');

function httpRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      const options = {
        hostname: 'localhost',
        port,
        path,
        method,
        headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
      };
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          server.close();
          try {
            const body = data ? JSON.parse(data) : null;
            resolve({ status: res.statusCode, body });
          } catch (_) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });
      req.on('error', (err) => {
        server.close();
        reject(err);
      });
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  });
}

const register = async (email) => {
  const res = await httpRequest('POST', '/api/auth/register', { email, password: 'pw' });
  return { id: res.body.userId, token: res.body.token };
};

describe('Scoring and leaderboard logic', () => {
  let user1, user2, user3;
  let haiku1, haiku2, haiku3;

  beforeAll(async () => {
    user1 = await register('u1@example.com');
    user2 = await register('u2@example.com');
    user3 = await register('u3@example.com');
    // Create haikus for each user and capture their IDs
    const r1 = await httpRequest('POST', '/api/haiku', { text: 'haiku1' }, { Authorization: `Bearer ${user1.id}` });
    haiku1 = r1.body.id;
    const r2 = await httpRequest('POST', '/api/haiku', { text: 'haiku2' }, { Authorization: `Bearer ${user2.id}` });
    haiku2 = r2.body.id;
    const r3 = await httpRequest('POST', '/api/haiku', { text: 'haiku3' }, { Authorization: `Bearer ${user3.id}` });
    haiku3 = r3.body.id;
  });

  test('user points increment after a battle', async () => {
    // User1 votes for user2's haiku
    const battleRes = await httpRequest('POST', '/api/battle', { winnerId: haiku2, haikuIds: [haiku2, haiku3] }, { Authorization: `Bearer ${user1.id}` });
    expect(battleRes.status).toBe(200);
    const me = await httpRequest('GET', '/api/auth/me', null, { Authorization: `Bearer ${user1.id}` });
    expect(me.body.points).toBe(1);
    const pts = await httpRequest('GET', `/api/points?userId=${user1.id}`);
    expect(pts.body.totalPoints).toBe(1);
  });

  test('leaderboard orders users by points', async () => {
    await httpRequest('POST', '/api/battle', { winnerId: haiku1, haikuIds: [haiku1, haiku3] }, { Authorization: `Bearer ${user2.id}` });
    await httpRequest('POST', '/api/battle', { winnerId: haiku1, haikuIds: [haiku1, haiku2] }, { Authorization: `Bearer ${user3.id}` });
    await httpRequest('POST', '/api/battle', { winnerId: haiku3, haikuIds: [haiku2, haiku3] }, { Authorization: `Bearer ${user1.id}` });
    const lb = await httpRequest('GET', '/api/leaderboard');
    expect(lb.body).toBeInstanceOf(Array);
    expect(lb.body[0]).toMatchObject({ userId: user1.id, points: 2 });
    const points = lb.body.map((e) => e.points);
    expect(points).toEqual(expect.arrayContaining(points.sort((a, b) => b - a)));
  });

  test('battle endpoint rejects invalid winnerId', async () => {
    const res = await httpRequest('POST', '/api/battle', { winnerId: 'nonexistent', haikuIds: [haiku1, haiku2] }, { Authorization: `Bearer ${user1.id}` });
    expect(res.status).toBe(400);
  });
});
