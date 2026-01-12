const request = require('supertest');
const { app } = require('../src/server');

describe('Battle pairing logic', () => {
  let userA, userB, userC;

  beforeAll(async () => {
    const resA = await request(app).post('/api/auth/register').send({ email: 'a@example.com', password: 'pw' });
    userA = resA.body;
    const resB = await request(app).post('/api/auth/register').send({ email: 'b@example.com', password: 'pw' });
    userB = resB.body;
    const resC = await request(app).post('/api/auth/register').send({ email: 'c@example.com', password: 'pw' });
    userC = resC.body;
    // Create one haiku for each user
    await request(app).post('/api/haiku').send({ text: 'haiku A' }).set('Authorization', `Bearer ${userA.id}`);
    await request(app).post('/api/haiku').send({ text: 'haiku B' }).set('Authorization', `Bearer ${userB.id}`);
    await request(app).post('/api/haiku').send({ text: 'haiku C' }).set('Authorization', `Bearer ${userC.id}`);
  });

  test('returns two random haikus excluding specified user', async () => {
    const res = await request(app).get(`/api/battle/pair?excludeUser=${userC.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const ids = res.body.map((h) => h.userId);
    expect(ids).not.toContain(userC.id);
    const [h1, h2] = res.body;
    expect(h1.id).not.toBe(h2.id);
  });

  test('fails when not enough haikus are available for pairing', async () => {
    const res = await request(app).get(`/api/battle/pair?excludeUser=${userA.id}`);
    expect(res.status).toBe(500);
  });
});
