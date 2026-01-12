const request = require('supertest');
const { app } = require('../src/server');

const register = async (email) => {
  const res = await request(app).post('/api/auth/register').send({ email, password: 'pw' });
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
    const r1 = await request(app).post('/api/haiku').set('Authorization', `Bearer ${user1.id}`).send({ text: 'haiku1' });
    haiku1 = r1.body.id;
    const r2 = await request(app).post('/api/haiku').set('Authorization', `Bearer ${user2.id}`).send({ text: 'haiku2' });
    haiku2 = r2.body.id;
    const r3 = await request(app).post('/api/haiku').set('Authorization', `Bearer ${user3.id}`).send({ text: 'haiku3' });
    haiku3 = r3.body.id;
  });

  test('user points increment after a battle', async () => {
    // User1 votes for user2's haiku
    const battleRes = await request(app)
      .post('/api/battle')
      .set('Authorization', `Bearer ${user1.id}`)
      .send({ winnerId: haiku2, haikuIds: [haiku2, haiku3] });
    expect(battleRes.status).toBe(200);
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${user1.id}`);
    expect(me.body.points).toBe(1);
    const pts = await request(app).get(`/api/points?userId=${user1.id}`);
    expect(pts.body.totalPoints).toBe(1);
  });

  test('leaderboard orders users by points', async () => {
    await request(app).post('/api/battle').set('Authorization', `Bearer ${user2.id}`).send({ winnerId: haiku1, haikuIds: [haiku1, haiku3] });
    await request(app).post('/api/battle').set('Authorization', `Bearer ${user3.id}`).send({ winnerId: haiku1, haikuIds: [haiku1, haiku2] });
    await request(app).post('/api/battle').set('Authorization', `Bearer ${user1.id}`).send({ winnerId: haiku3, haikuIds: [haiku2, haiku3] });
    const lb = await request(app).get('/api/leaderboard');
    expect(lb.body).toBeInstanceOf(Array);
    expect(lb.body[0]).toMatchObject({ userId: user1.id, points: 2 });
    const points = lb.body.map((e) => e.points);
    expect(points).toEqual(expect.arrayContaining(points.sort((a, b) => b - a)));
  });

  test('battle endpoint rejects invalid winnerId', async () => {
    const res = await request(app)
      .post('/api/battle')
      .set('Authorization', `Bearer ${user1.id}`)
      .send({ winnerId: 'nonexistent', haikuIds: [haiku1, haiku2] });
    expect(res.status).toBe(400);
  });
});
